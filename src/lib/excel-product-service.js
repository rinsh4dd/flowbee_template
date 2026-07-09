const PRODUCT_COLUMN_ALIASES = {
  productName: ["productname", "product", "name", "producttitle", "itemname", "item"],
  quantity: ["quantity", "qty", "weight", "size", "pack"],
  oldPrice: ["oldprice", "mrp", "beforeprice", "regularprice", "wasprice"],
  offerPrice: ["offerprice", "price", "saleprice", "dealprice", "discountprice"],
  badgeText: ["badgetext", "badge", "tag", "label", "promotion", "promo"],
  imageUrl: ["imageurl", "image", "photo", "photourl", "productimage"],
};

const PRODUCT_TEMPLATE_HEADERS = [
  "Product Name",
  "Quantity",
  "Old Price",
  "Offer Price",
  "Badge Text",
  "Image URL",
];

const REQUIRED_COLUMNS = ["productName", "offerPrice"];

const cleanHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const cleanCell = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const xmlText = (xml, tagName) =>
  Array.from(xml.getElementsByTagName(tagName))
    .map((node) => node.textContent || "")
    .join("");

const columnIndexFromRef = (cellRef = "") => {
  const letters = cellRef.replace(/[0-9]/g, "").toUpperCase();
  let index = 0;
  for (const letter of letters) {
    index = index * 26 + letter.charCodeAt(0) - 64;
  }
  return Math.max(index - 1, 0);
};

const parseCsvLine = (line) => {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
};

const parseCsvRows = (text) =>
  text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map(parseCsvLine);

const readUint16 = (view, offset) => view.getUint16(offset, true);
const readUint32 = (view, offset) => view.getUint32(offset, true);
const writeUint16 = (value) => {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
};
const writeUint32 = (value) => {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, true);
  return bytes;
};

const textBytes = (text) => new TextEncoder().encode(text);

const concatBytes = (parts) => {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;

  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });

  return output;
};

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const columnName = (index) => {
  let name = "";
  let value = index + 1;
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
};

const buildZipBlob = (files) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach(({ name, content }) => {
    const nameBytes = textBytes(name);
    const dataBytes = textBytes(content);
    const checksum = crc32(dataBytes);

    const localHeader = concatBytes([
      writeUint32(0x04034b50),
      writeUint16(20),
      writeUint16(0),
      writeUint16(0),
      writeUint16(0),
      writeUint16(0),
      writeUint32(checksum),
      writeUint32(dataBytes.length),
      writeUint32(dataBytes.length),
      writeUint16(nameBytes.length),
      writeUint16(0),
      nameBytes,
    ]);

    const centralHeader = concatBytes([
      writeUint32(0x02014b50),
      writeUint16(20),
      writeUint16(20),
      writeUint16(0),
      writeUint16(0),
      writeUint16(0),
      writeUint16(0),
      writeUint32(checksum),
      writeUint32(dataBytes.length),
      writeUint32(dataBytes.length),
      writeUint16(nameBytes.length),
      writeUint16(0),
      writeUint16(0),
      writeUint16(0),
      writeUint16(0),
      writeUint32(0),
      writeUint32(offset),
      nameBytes,
    ]);

    localParts.push(localHeader, dataBytes);
    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  });

  const centralDirectory = concatBytes(centralParts);
  const endOfCentralDirectory = concatBytes([
    writeUint32(0x06054b50),
    writeUint16(0),
    writeUint16(0),
    writeUint16(files.length),
    writeUint16(files.length),
    writeUint32(centralDirectory.length),
    writeUint32(offset),
    writeUint16(0),
  ]);

  return new Blob([...localParts, centralDirectory, endOfCentralDirectory], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

const findEndOfCentralDirectory = (bytes) => {
  const minOffset = Math.max(0, bytes.length - 65557);
  for (let offset = bytes.length - 22; offset >= minOffset; offset -= 1) {
    if (
      bytes[offset] === 0x50 &&
      bytes[offset + 1] === 0x4b &&
      bytes[offset + 2] === 0x05 &&
      bytes[offset + 3] === 0x06
    ) {
      return offset;
    }
  }
  throw new Error("This file is not a valid .xlsx workbook.");
};

const inflateRaw = async (bytes) => {
  if (!("DecompressionStream" in window)) {
    throw new Error("This browser cannot read compressed .xlsx files. Please upload CSV instead.");
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

const readZipEntries = async (arrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  const decoder = new TextDecoder();
  const eocdOffset = findEndOfCentralDirectory(bytes);
  const entryCount = readUint16(view, eocdOffset + 10);
  const centralDirectoryOffset = readUint32(view, eocdOffset + 16);
  const entries = new Map();
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (readUint32(view, offset) !== 0x02014b50) {
      throw new Error("Could not read workbook directory.");
    }

    const compression = readUint16(view, offset + 10);
    const compressedSize = readUint32(view, offset + 20);
    const fileNameLength = readUint16(view, offset + 28);
    const extraLength = readUint16(view, offset + 30);
    const commentLength = readUint16(view, offset + 32);
    const localHeaderOffset = readUint32(view, offset + 42);
    const nameStart = offset + 46;
    const fileName = decoder.decode(bytes.slice(nameStart, nameStart + fileNameLength));

    const localNameLength = readUint16(view, localHeaderOffset + 26);
    const localExtraLength = readUint16(view, localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);

    let content;
    if (compression === 0) {
      content = compressed;
    } else if (compression === 8) {
      content = await inflateRaw(compressed);
    } else {
      throw new Error(`Unsupported .xlsx compression method: ${compression}`);
    }

    entries.set(fileName, decoder.decode(content));
    offset = nameStart + fileNameLength + extraLength + commentLength;
  }

  return entries;
};

const parseSharedStrings = (xmlTextValue) => {
  if (!xmlTextValue) return [];
  const xml = new DOMParser().parseFromString(xmlTextValue, "application/xml");
  return Array.from(xml.getElementsByTagName("si")).map((node) => xmlText(node, "t"));
};

const parseSheetRows = (sheetXml, sharedStrings) => {
  const xml = new DOMParser().parseFromString(sheetXml, "application/xml");
  const rowNodes = Array.from(xml.getElementsByTagName("row"));

  return rowNodes.map((rowNode) => {
    const cells = [];
    Array.from(rowNode.getElementsByTagName("c")).forEach((cellNode) => {
      const index = columnIndexFromRef(cellNode.getAttribute("r"));
      const type = cellNode.getAttribute("t");
      const valueNode = cellNode.getElementsByTagName("v")[0];
      let value = "";

      if (type === "inlineStr") {
        value = xmlText(cellNode, "t");
      } else if (valueNode) {
        const rawValue = valueNode.textContent || "";
        value = type === "s" ? sharedStrings[Number(rawValue)] || "" : rawValue;
      }

      cells[index] = value;
    });
    return cells.map(cleanCell);
  });
};

const parseXlsxRows = async (file) => {
  const entries = await readZipEntries(await file.arrayBuffer());
  const sheetXml = entries.get("xl/worksheets/sheet1.xml");
  if (!sheetXml) {
    throw new Error("No first worksheet found in this Excel file.");
  }

  return parseSheetRows(sheetXml, parseSharedStrings(entries.get("xl/sharedStrings.xml")));
};

const buildColumnMap = (headers) => {
  const normalizedHeaders = headers.map(cleanHeader);
  return Object.entries(PRODUCT_COLUMN_ALIASES).reduce((map, [field, aliases]) => {
    const index = normalizedHeaders.findIndex((header) => aliases.includes(header));
    if (index >= 0) {
      map[field] = index;
    }
    return map;
  }, {});
};

const mapRowsToProducts = (rows) => {
  const [headers = [], ...dataRows] = rows;
  const columnMap = buildColumnMap(headers);
  const missingColumns = REQUIRED_COLUMNS.filter((field) => columnMap[field] === undefined);

  if (missingColumns.length > 0) {
    throw new Error("Excel must include Product Name and Offer Price columns.");
  }

  const skippedRows = [];
  const products = dataRows.reduce((items, row, rowIndex) => {
    const product = {
      productName: cleanCell(row[columnMap.productName]),
      quantity: cleanCell(row[columnMap.quantity]),
      oldPrice: cleanCell(row[columnMap.oldPrice]),
      offerPrice: cleanCell(row[columnMap.offerPrice]),
      badgeText: cleanCell(row[columnMap.badgeText]),
      imageUrl: cleanCell(row[columnMap.imageUrl]),
    };

    if (!product.productName || !product.offerPrice) {
      if (row.some((value) => cleanCell(value))) {
        skippedRows.push(rowIndex + 2);
      }
      return items;
    }

    items.push({
      id: Math.random().toString(36).substring(2, 9),
      ...product,
      createdAt: new Date().toISOString(),
    });
    return items;
  }, []);

  return { products, skippedRows };
};

export const parseProductExcel = async (file) => {
  if (!file) {
    throw new Error("Please select an Excel file.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  const rows =
    extension === "csv"
      ? parseCsvRows(await file.text())
      : await parseXlsxRows(file);

  if (rows.length < 2) {
    throw new Error("Excel must include one header row and at least one product row.");
  }

  return mapRowsToProducts(rows);
};

const buildProductTemplateWorkbook = () => {
  const headerCells = PRODUCT_TEMPLATE_HEADERS.map((header, index) => {
    const ref = `${columnName(index)}1`;
    return `<c r="${ref}" s="1" t="inlineStr"><is><t>${escapeXml(header)}</t></is></c>`;
  }).join("");

  return [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Products" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      name: "xl/styles.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF065F46"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFE2E8F0"/></left><right style="thin"><color rgb="FFE2E8F0"/></right><top style="thin"><color rgb="FFE2E8F0"/></top><bottom style="thin"><color rgb="FFE2E8F0"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyProtection="1"><protection locked="0"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1" applyProtection="1"><alignment horizontal="center"/><protection locked="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyProtection="1"><protection locked="0"/></xf></cellXfs></styleSheet>`,
    },
    {
      name: "xl/worksheets/sheet1.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:F1"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="26" customWidth="1" style="2"/><col min="2" max="2" width="16" customWidth="1" style="2"/><col min="3" max="4" width="13" customWidth="1" style="2"/><col min="5" max="5" width="16" customWidth="1" style="2"/><col min="6" max="6" width="44" customWidth="1" style="2"/></cols><sheetData><row r="1" ht="22" customHeight="1">${headerCells}</row></sheetData></worksheet>`,
    },
  ];
};

export const downloadProductExcelTemplate = () => {
  const blob = buildZipBlob(buildProductTemplateWorkbook());
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "flowbee-product-import-template.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

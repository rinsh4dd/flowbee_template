"use client";

import { useEffect, useState, useRef } from "react";
import { authService } from "@/lib/auth-service";
import { ArrowRight, Sparkles, X, LogOut, Menu, LogIn, UserPlus, Eye, EyeOff, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth Modal State
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [modalIsRegister, setModalIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const mobileMenuRef = useRef(null);
  const linksRef = useRef([]);
  linksRef.current = [];

  const addToLinksRef = (el) => {
    if (el && !linksRef.current.includes(el)) {
      linksRef.current.push(el);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((currentUser) => {
      if (currentUser && currentUser.role === "admin") {
        router.push("/admin/templates");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");
    setModalLoading(true);

    try {
      if (modalIsRegister) {
        const registered = await authService.register(email, password);
        setModalSuccess("Account created successfully!");
        setTimeout(() => {
          setLoginModalOpen(false);
          if (registered.role === "admin") {
            router.push("/admin/templates");
          } else {
            router.push("/dashboard");
          }
        }, 1200);
      } else {
        const loggedIn = await authService.login(email, password);
        setModalSuccess("Signed in successfully!");
        setTimeout(() => {
          setLoginModalOpen(false);
          if (loggedIn.role === "admin") {
            router.push("/admin/templates");
          } else {
            router.push("/dashboard");
          }
        }, 1000);
      }
    } catch (err) {
      setModalError(err.message || "Authentication failed.");
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      // Slide overlay from right
      gsap.fromTo(mobileMenuRef.current, 
        { x: "100%" }, 
        { x: "0%", duration: 0.4, ease: "power3.out" }
      );
      // Stagger animate links entrance
      if (linksRef.current.length > 0) {
        gsap.fromTo(linksRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, delay: 0.15, ease: "power2.out" }
        );
      }
    }
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#f97316] selection:text-white flex flex-col justify-between">
      
      {/* Navbar Header matching layout logo center */}
      <nav className={`fixed top-0 left-0 right-0 w-full px-6 sm:px-12 z-50 transition-all duration-300 flex items-center justify-between ${
        scrolled 
          ? "bg-white/95 border-b border-slate-200/80 backdrop-blur-md shadow-sm py-4" 
          : "bg-transparent border-b border-transparent py-6"
      }`}>
        <div className="flex items-center">
          <img 
            src="https://flowbee.io/images/logo.png" 
            alt="flowbee logo" 
            className="h-4.5 w-auto object-contain" 
          />
        </div>

        {/* Center Navigation Links */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-8">
          <a 
            href="#templates" 
            className="text-[10px] font-bold tracking-widest text-slate-500 hover:text-slate-900 transition duration-200 uppercase"
          >
            TEMPLATES
          </a>
          <Link 
            href="/dashboard" 
            className="text-[10px] font-bold tracking-widest text-slate-500 hover:text-slate-900 transition duration-200 uppercase"
          >
            WORKSPACE
          </Link>
        </div>

        {/* Right Actions Block */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-9 bg-slate-100 rounded-full animate-pulse" />
          ) : user ? (
            <button
              onClick={() => setProfileOpen(true)}
              className="h-9 w-9 rounded-full bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center font-bold text-xs border border-slate-200/50 shadow-sm transition duration-200 cursor-pointer"
              title={user.email || "Profile"}
            >
              <span>{user.email ? user.email[0].toUpperCase() : "U"}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setLoginModalOpen(true);
                setModalIsRegister(false);
                setModalError("");
                setModalSuccess("");
              }}
              className="flex items-center gap-1 bg-[#111111] hover:bg-slate-800 px-4 py-2 rounded-full text-xs font-bold text-white transition duration-200 shadow-sm cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          )}

          {/* Hamburger Menu Icon for Mobile screens */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="sm:hidden p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Main Content (White Mode) */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-12 pt-28 pb-16 flex flex-col items-center">
        
        {/* Title Headline block */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center leading-[1.1] max-w-4xl font-sans text-slate-900 select-none lowercase">
          We create striking <br />
          brochures and layouts <br />
          <span className="text-[#a1a1aa] font-medium block mt-2">
            that help your business <br />
            grow fast
          </span>
        </h1>

        {/* Small Dual Sub-Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full mt-12 text-[11px] text-slate-500 leading-relaxed text-center md:text-left font-medium">
          <p>
            We combine catalog template schemas, items grid logic, and print design parameters to compile stunning promotional flyers that connect and drive retail growth.
          </p>
          <p className="md:pl-4">
            Our automated PDF rendering engine generates print-ready brochures with custom color styles, dynamic QR-codes, and OMR pricing structures instantly.
          </p>
        </div>

        {/* Dynamic Cards Carousel List */}
        <div id="templates" className="w-full mt-16 overflow-x-auto no-scrollbar py-4 scroll-mt-24">
          <div className="flex gap-5 min-w-max px-2">
            {/* Card 1: Hypermarket Offers */}
            <div className="w-56 h-64 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-md hover:scale-[1.01] transition duration-300 bg-black text-white">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300')] bg-cover bg-center opacity-65 group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
              <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-orange-600/30 blur-2xl z-10" />
              <span className="self-start text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white uppercase tracking-wider z-20">
                A4 Flyer
              </span>
              <span className="font-bold text-white text-base z-20">Hypermarket Offers</span>
            </div>

            {/* Card 2: Supermarket Deals (Active glowing theme card) */}
            <div className="w-56 h-64 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-lg hover:scale-[1.01] transition duration-300 bg-black text-white">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=300')] bg-cover bg-center opacity-70 group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent z-10" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-orange-600/55 blur-2xl z-10" />
              <span className="self-start text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white uppercase tracking-wider z-20">
                Automated Grid
              </span>
              <div className="z-20 space-y-3">
                <span className="font-bold text-white text-base block">Supermarket Deals</span>
                <button
                  onClick={() => {
                    if (user) {
                      router.push("/dashboard");
                    } else {
                      setLoginModalOpen(true);
                      setModalIsRegister(false);
                      setModalError("");
                      setModalSuccess("");
                    }
                  }}
                  className="inline-flex items-center justify-center bg-white hover:bg-slate-100 text-black text-[10px] font-bold px-4.5 py-2 rounded-full transition shadow-sm cursor-pointer"
                >
                  Get started
                </button>
              </div>
            </div>

            {/* Card 3: Restaurant Specials */}
            <div className="w-56 h-64 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-md hover:scale-[1.01] transition duration-300 bg-black text-white">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=300')] bg-cover bg-center opacity-65 group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
              <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-orange-600/30 blur-2xl z-10" />
              <span className="self-start text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white uppercase tracking-wider z-20">
                Menu Builder
              </span>
              <span className="font-bold text-white text-base z-20">Restaurant Specials</span>
            </div>

            {/* Card 4: Electronics Flyer */}
            <div className="w-56 h-64 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-md hover:scale-[1.01] transition duration-300 bg-black text-white">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300')] bg-cover bg-center opacity-65 group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
              <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-orange-600/30 blur-2xl z-10" />
              <span className="self-start text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white uppercase tracking-wider z-20">
                Grid Layout
              </span>
              <span className="font-bold text-white text-base z-20">Electronics Flyer</span>
            </div>

            {/* Card 5: Wholesale Catalog */}
            <div className="w-56 h-64 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-md hover:scale-[1.01] transition duration-300 bg-black text-white">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=300')] bg-cover bg-center opacity-65 group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
              <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-orange-600/30 blur-2xl z-10" />
              <span className="self-start text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white uppercase tracking-wider z-20">
                B2B Layout
              </span>
              <span className="font-bold text-white text-base z-20">Wholesale Catalog</span>
            </div>

            {/* Card 6: Smart Catalog */}
            <div className="w-56 h-64 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-md hover:scale-[1.01] transition duration-300 bg-black text-white">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300')] bg-cover bg-center opacity-65 group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
              <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-orange-600/30 blur-2xl z-10" />
              <span className="self-start text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white uppercase tracking-wider z-20">
                QR Code Sync
              </span>
              <span className="font-bold text-white text-base z-20">Smart Catalog</span>
            </div>
          </div>
        </div>
      </main>

      {/* Profile Details Sidebar Drawer */}
      {user && (
        <div className={`fixed inset-0 z-50 transition-all duration-300 ${profileOpen ? "visible" : "invisible"}`}>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
              profileOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setProfileOpen(false)}
          />
          {/* Drawer */}
          <div className={`fixed right-0 top-0 h-full w-96 max-w-full bg-white border-l border-slate-200 shadow-2xl z-55 p-6 flex flex-col justify-between transform transition-transform duration-300 ${
            profileOpen ? "translate-x-0" : "translate-x-full"
          }`}>
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h3 className="font-bold text-slate-855 text-[10px] tracking-widest uppercase">User Details</h3>
                <button 
                  onClick={() => setProfileOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* User Info Card */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-base border border-slate-200 shadow-sm">
                    {user.email ? user.email[0].toUpperCase() : "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Logged In As</p>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-left">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Account Role</p>
                    <p className="text-xs font-bold text-slate-800 uppercase mt-0.5 tracking-wide">
                      {user.role || "User"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">User ID</p>
                    <p className="text-[9px] font-mono text-slate-500 mt-0.5 truncate">{user.uid}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                href="/dashboard"
                className="flex items-center justify-center gap-1.5 w-full bg-[#111111] hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold transition duration-200"
                onClick={() => setProfileOpen(false)}
              >
                <span>Go to Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              
              {user.role === "admin" && (
                <Link 
                  href="/admin/templates"
                  className="flex items-center justify-center gap-1.5 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl text-xs font-bold transition duration-200"
                  onClick={() => setProfileOpen(false)}
                >
                  <span>Admin Settings</span>
                </Link>
              )}

              <button
                onClick={async () => {
                  setProfileOpen(false);
                  await authService.logout();
                  router.push("/login");
                }}
                className="flex items-center justify-center gap-1.5 w-full border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-red-600 py-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GSAP Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="fixed inset-0 bg-white z-55 p-8 flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <img 
              src="https://flowbee.io/images/logo.png" 
              alt="flowbee logo" 
              className="h-5 w-auto object-contain" 
            />
            <button 
              onClick={() => {
                gsap.to(mobileMenuRef.current, {
                  x: "100%",
                  duration: 0.35,
                  ease: "power3.in",
                  onComplete: () => setMobileMenuOpen(false)
                });
              }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Big Text Menu Links */}
          <div className="flex flex-col gap-6 py-12">
            <a 
              ref={addToLinksRef}
              href="#templates" 
              onClick={() => {
                gsap.to(mobileMenuRef.current, {
                  x: "100%",
                  duration: 0.3,
                  onComplete: () => {
                    setMobileMenuOpen(false);
                    const target = document.getElementById("templates");
                    if (target) target.scrollIntoView({ behavior: "smooth" });
                  }
                });
              }}
              className="text-4xl font-extrabold tracking-tight text-slate-900 hover:text-orange-600 transition"
            >
              TEMPLATES
            </a>
            <Link 
              ref={addToLinksRef}
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-4xl font-extrabold tracking-tight text-slate-900 hover:text-orange-600 transition"
            >
              WORKSPACE
            </Link>
            
            {user ? (
              <button
                ref={addToLinksRef}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileOpen(true);
                }}
                className="text-4xl font-extrabold tracking-tight text-slate-900 hover:text-orange-600 transition text-left cursor-pointer"
              >
                PROFILE DETAILS
              </button>
            ) : (
              <button 
                ref={addToLinksRef}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLoginModalOpen(true);
                  setModalIsRegister(false);
                  setModalError("");
                  setModalSuccess("");
                }}
                className="text-4xl font-extrabold tracking-tight text-slate-900 hover:text-orange-600 transition text-left cursor-pointer"
              >
                SIGN IN
              </button>
            )}
          </div>

          {/* Footer Info */}
          <div className="border-t border-slate-100 pt-6 text-xs text-slate-400 font-semibold tracking-wide">
            <p>© 2026 flowbee. print-ready catalogue engines.</p>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-slate-50 border-t border-slate-200/80 w-full py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & Slogan Column */}
          <div className="space-y-4">
            <img 
              src="https://flowbee.io/images/logo.png" 
              alt="flowbee logo" 
              className="h-6 w-auto object-contain" 
            />
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Create high-resolution, print-ready PDF flyers and product catalogues automatically in seconds.
            </p>
          </div>

          {/* Marketing Templates Column */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-4">Templates</h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
              <li>
                <a href="#templates" className="hover:text-slate-900 transition">Hypermarket Grid</a>
              </li>
              <li>
                <a href="#templates" className="hover:text-slate-900 transition">Supermarket Deals</a>
              </li>
              <li>
                <a href="#templates" className="hover:text-slate-900 transition">Restaurant Specials</a>
              </li>
              <li>
                <a href="#templates" className="hover:text-slate-900 transition">Electronics Catalog</a>
              </li>
            </ul>
          </div>

          {/* Platform Workspace Column */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-4">Workspace</h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 transition">My Campaigns</Link>
              </li>
              <li>
                <Link href="/campaigns/new" className="hover:text-slate-900 transition">Layout Editor</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 transition">Saved Layouts</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-900 transition">Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-4">Support</h4>
            <p className="text-xs text-slate-500 font-medium">
              Need assistance building flyer templates?
            </p>
            <p className="text-xs text-slate-800 font-bold">
              support@flowbee.io
            </p>
          </div>
        </div>

        {/* Bottom Rights Bar */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-12 pt-8 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© 2026 flowbee. striking concepts in brochure layout design.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-600 transition">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* Login and Registration Modal Overlay */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 opacity-100"
            onClick={() => setLoginModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white border border-slate-200/60 w-full max-w-md p-6 sm:p-10 shadow-xl rounded-3xl z-10 transition-all duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center items-center gap-2.5">
                <img 
                  src="https://flowbee.io/images/logo.png" 
                  alt="flowbee logo" 
                  className="h-6 w-auto object-contain shrink-0" 
                />
                <span className="text-2xl font-black tracking-tight text-slate-900 lowercase">
                  flowbee
                </span>
              </div>
              <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {modalIsRegister ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 font-medium">
                Or{" "}
                <button
                  onClick={() => {
                    setModalIsRegister(!modalIsRegister);
                    setModalError("");
                    setModalSuccess("");
                  }}
                  className="font-bold text-[#f97316] hover:text-[#ea580c] transition underline underline-offset-4 cursor-pointer"
                >
                  {modalIsRegister ? "sign in to your existing account" : "register a new account"}
                </button>
              </p>
            </div>

            {/* Status alerts */}
            {modalError && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-xs font-bold text-red-650 leading-relaxed text-left">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs font-bold text-emerald-650 leading-relaxed text-left">
                {modalSuccess}
              </div>
            )}

            {/* Form */}
            <form className="space-y-4 text-left" onSubmit={handleModalSubmit}>
              <div>
                <label htmlFor="modal-email" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <input
                  id="modal-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/40 transition text-sm font-medium"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label htmlFor="modal-password" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="modal-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/40 transition text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-[#f97316] hover:bg-[#ea580c] transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-1.5 cursor-pointer animate-none"
                >
                  {modalLoading ? (
                    <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full h-3.5 w-3.5"></span>
                  ) : modalIsRegister ? (
                    <>
                      <UserPlus className="h-3.5 w-3.5" /> Register
                    </>
                  ) : (
                    <>
                      <LogIn className="h-3.5 w-3.5" /> Sign In
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

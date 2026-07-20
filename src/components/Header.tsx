import React, { useState, useEffect } from 'react';
import { useAuth, TEST_PARENT_TOKEN, TEST_ADMIN_TOKEN, TEST_VISITOR_TOKEN } from '@/hooks/auth-context';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, MessageCircle, MapPin, User as UserIcon, LogOut, UserCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { defaultInquirySms, directionsUrl } from '@/lib/contact';
import { scrollToSection as scrollToSectionShared } from '@/lib/scrollToSection';
import { trackCta } from '@/lib/analytics';

const Header = () => {
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/#about-section' }, // Using hash anchors for flexibility
    { name: 'Programs', path: '/#programs-section' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Contact', path: '/#contact-section' },
  ];

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      login(credentialResponse.credential);
      setShowLoginDialog(false);
      navigate("/checkin");
    }
  };

  const handleTestLogin = (token: string) => {
    login(token);
    setShowLoginDialog(false);
    setMobileMenuOpen(false);
    navigate("/checkin");
  };

  const scrollToSection = (path: string) => scrollToSectionShared(path, location.pathname, navigate);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-md py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className={cn(
            "text-2xl font-black tracking-tighter transition-colors",
            isScrolled ? "text-slate-500" : "text-slate-500 drop-shadow-md"
          )}>
            Aama<span className="text-secondary">Daycare</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.path)}
              className={cn(
                "text-sm font-bold uppercase tracking-wider transition-colors hover:text-secondary cursor-pointer",
                isScrolled ? "text-slate-900" : "text-slate-900 drop-shadow-sm font-black"
              )}
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <a href="tel:5107783220" onClick={() => trackCta('call', 'header_desktop')}>
            <Button variant={isScrolled ? "default" : "secondary"} size="sm" className="gap-2 font-bold shadow-lg">
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">Call Now</span>
            </Button>
          </a>
          <a href={defaultInquirySms} onClick={() => trackCta('text', 'header_desktop')}>
            <Button variant="outline" size="sm" className="gap-2 font-bold">
              <MessageCircle className="w-4 h-4" />
              Text
            </Button>
          </a>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta('directions', 'header_desktop')}
          >
            <Button variant="outline" size="sm" className="gap-2 font-bold">
              <MapPin className="w-4 h-4" />
              Directions
            </Button>
          </a>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-4 border-l border-slate-300 outline-none">
                  <Avatar className="h-8 w-8 border border-slate-200">
                    <AvatarImage src={user.picture as string | undefined} alt={user.name} />
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email as string | undefined}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/checkin" className="flex items-center gap-2 cursor-pointer">
                    <UserCircle className="w-4 h-4" />
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant={isScrolled ? "outline" : "outline"}
                size="sm"
                className="gap-2 font-bold"
                onClick={() => setShowLoginDialog(true)}
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </Button>

              {/* Hidden Google Login - shown in dialog */}
              {showLoginDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6" onClick={() => setShowLoginDialog(false)}>
                  <div className="p-8 bg-white rounded-[2rem] shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShowLoginDialog(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-2xl font-bold mb-4 text-slate-900">Sign In</h3>
                    <p className="text-slate-600 mb-6">Sign in with your Google account. Parents can check their child in or out; admins can view the admin dashboard.</p>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.log('Login Failed')}
                      width="100%"
                    />
                    {import.meta.env.DEV && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                          Dev only
                        </span>
                        <Button variant="outline" size="sm" onClick={() => handleTestLogin(TEST_PARENT_TOKEN)}>
                          Test Sign In: Parent
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleTestLogin(TEST_ADMIN_TOKEN)}>
                          Test Sign In: Admin
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleTestLogin(TEST_VISITOR_TOKEN)}>
                          Test Sign In: Visitor
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <a href="tel:5107783220" onClick={() => trackCta('call', 'header_mobile')}>
            <div className="p-2 bg-primary text-white rounded-full shadow-lg">
              <Phone className="w-4 h-4" />
            </div>
          </a>
          <a href={defaultInquirySms} onClick={() => trackCta('text', 'header_mobile')}>
            <div className="p-2 bg-primary text-white rounded-full shadow-lg">
              <MessageCircle className="w-4 h-4" />
            </div>
          </a>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta('directions', 'header_mobile')}
          >
            <div className="p-2 bg-primary text-white rounded-full shadow-lg">
              <MapPin className="w-4 h-4" />
            </div>
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn("p-2", isScrolled ? "text-slate-900" : "text-slate-900")}
          >
            {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8 drop-shadow-md" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-2 lg:hidden">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                scrollToSection(link.path);
                setMobileMenuOpen(false);
              }}
              className="text-lg font-bold text-slate-700 py-2 border-b border-slate-50 text-left"
            >
              {link.name}
            </button>
          ))}

          <div className="pt-4 flex flex-col gap-4">
            {!user ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-slate-500 font-medium">Sign In</span>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log('Login Failed')}
                  width="100%"
                />
                {import.meta.env.DEV && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                      Dev only
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleTestLogin(TEST_PARENT_TOKEN)}>
                      Test Sign In: Parent
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleTestLogin(TEST_ADMIN_TOKEN)}>
                      Test Sign In: Admin
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleTestLogin(TEST_VISITOR_TOKEN)}>
                      Test Sign In: Visitor
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-200">
                    <AvatarImage src={user.picture as string | undefined} alt={user.name} />
                    <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                      {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email as string | undefined}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to="/checkin" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5">
                      <UserCircle className="w-4 h-4" />
                      My Account
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout} className="flex-1 gap-1.5 text-destructive hover:text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

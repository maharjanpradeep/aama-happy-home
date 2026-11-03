import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { GoogleLogin } from '@react-oauth/google';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_EMAIL, CONTACT_PHONE, defaultInquiryMailto, defaultInquirySms, directionsUrl } from '@/lib/contact';
import { trackCta } from '@/lib/analytics';
import { getAttribution } from '@/lib/attribution';
import { ApiError, isInquiryApiConfigured, submitInquiry } from '@/lib/checkin';

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

const SCHEDULE_OPTIONS = ['Full-time', 'Part-time', 'After school', 'Not sure yet'];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  childAge: '',
  startDate: '',
  schedule: '',
  message: '',
  // Honeypot: hidden from people, so only bots fill it in.
  website: '',
};
import { SOCIAL_URLS } from '@/lib/social';

const Contact = () => {
  const { user, login, logout } = useAuth();
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fallback when no backend is configured (e.g. local dev without .env): the old
  // behaviour of opening the visitor's mail app. Not counted as a conversion.
  const openMailFallback = () => {
    const subject = encodeURIComponent(`New Inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone}\n` +
      `Child's Age: ${formData.childAge}\n` +
      `Start Date: ${formData.startDate}\n` +
      `Schedule: ${formData.schedule}\n\n` +
      `Message:\n${formData.message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!isInquiryApiConfigured()) {
      openMailFallback();
      return;
    }

    setStatus('sending');
    setErrorMessage('');
    try {
      await submitInquiry({ ...formData, ...getAttribution() });
      // Counted only once the backend has actually emailed the inquiry.
      trackCta('inquiry_submit', 'contact_form');
      setStatus('sent');
      setFormData(EMPTY_FORM);
    } catch (err) {
      // Server errors carry a visitor-friendly message; a dropped connection doesn't.
      setErrorMessage(
        err instanceof ApiError && err.message
          ? err.message
          : "We couldn't send your message. Please check your connection, or call or text us."
      );
      setStatus('error');
    }
  };

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    if (credentialResponse.credential) {
      login(credentialResponse.credential);
    }
  };

  return (
    <main>
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white" id="contact-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
              Get In Touch
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
              Start Your Journey With Us
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We have limited spots available! Contact us today to check availability and schedule a tour.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:items-stretch">
            {/* Left: Contact Details & Map */}
            <div className="flex flex-col gap-8 h-full">
              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="border-none shadow-md bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                      <Phone className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Call Us</h3>
                    <p className="text-slate-500 mb-4 text-sm">Mon-Fri from 7:30am to 6pm</p>
                    <a href={`tel:${CONTACT_PHONE}`} className="w-full" onClick={() => trackCta('call', 'contact_card')}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">Call Now</Button>
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Email Us</h3>
                    <p className="text-slate-500 mb-4 text-sm">We'll respond within 24h</p>
                    <a href={defaultInquiryMailto} className="w-full" onClick={() => trackCta('email', 'contact_card')}>
                      <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 font-bold">Email Me</Button>
                    </a>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-md overflow-hidden bg-white flex-1 flex flex-col">
                <CardContent className="p-0 flex flex-col flex-1">
                  <div className="p-6 pb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-primary" />
                      Visit Us
                    </h3>
                    <p className="text-slate-600 mb-4">737 Birdwood Ct, San Ramon, CA 94582</p>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                      onClick={() => trackCta('directions', 'contact_map')}
                    >
                      <Button variant="outline" className="gap-2 font-bold border-primary text-primary hover:bg-primary/5">
                        <MapPin className="w-4 h-4" />
                        Get Directions
                      </Button>
                    </a>
                  </div>
                  <div className="flex-1 min-h-[280px] w-full bg-slate-100">
                    <iframe
                      title="Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3154.086009569338!2d-121.90513408820796!3d37.76458141262973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f9166d5630e35%3A0x812bc0d68c63f10f!2sAama%20Day%20Care%20Center!5e0!3m2!1sen!2sus!4v1782077771144!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      className="min-h-[280px]"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">Follow us</h3>
                    <p className="text-slate-500 text-sm">See what the kids are up to every week.</p>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={SOCIAL_URLS.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Aama Daycare on Facebook"
                      onClick={() => trackCta('facebook', 'contact_follow')}
                      className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Facebook className="w-6 h-6" />
                    </a>
                    <a
                      href={SOCIAL_URLS.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Aama Daycare on Instagram"
                      onClick={() => trackCta('instagram', 'contact_follow')}
                      className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Inquiry Form */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>

              <h3 className="text-2xl font-black text-slate-900 mb-2">Send an Inquiry</h3>
              <p className="text-slate-500 mb-6">Fill out the form below and we'll get back to you to schedule your visit.</p>

              {status === 'sent' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10" role="status" aria-live="polite">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Thank you! We got your message.</h4>
                  <p className="text-slate-600 mb-6 max-w-sm">
                    We'll call or text you within one business day to answer your questions and set up a tour.
                  </p>
                  <Button variant="outline" onClick={() => setStatus('idle')}>Send another inquiry</Button>
                </div>
              ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5 flex-1 flex flex-col">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name" name="name" placeholder="Your full name" required maxLength={100}
                      autoComplete="name"
                      value={formData.name} onChange={handleInputChange}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone" name="phone" type="tel" placeholder="Your phone number" required maxLength={30}
                      autoComplete="tel"
                      value={formData.phone} onChange={handleInputChange}
                      className="bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address <span className="text-slate-400 font-normal">(optional)</span></Label>
                    <Input
                      id="email" name="email" type="email" placeholder="your@email.com" maxLength={200}
                      autoComplete="email"
                      value={formData.email} onChange={handleInputChange}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childAge">Child's Age</Label>
                    <Input
                      id="childAge" name="childAge" placeholder="e.g. 2 years old" required maxLength={60}
                      value={formData.childAge} onChange={handleInputChange}
                      className="bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Desired Start Date <span className="text-slate-400 font-normal">(optional)</span></Label>
                    <Input
                      id="startDate" name="startDate" placeholder="e.g. January 2027" maxLength={60}
                      value={formData.startDate} onChange={handleInputChange}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule <span className="text-slate-400 font-normal">(optional)</span></Label>
                    <select
                      id="schedule" name="schedule"
                      value={formData.schedule} onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                    >
                      <option value="">Choose one…</option>
                      {SCHEDULE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <Label htmlFor="message">Message / Questions <span className="text-slate-400 font-normal">(optional)</span></Label>
                  <Textarea
                    id="message" name="message" placeholder="Tell us about your childcare needs..." maxLength={2000}
                    className="bg-slate-50 flex-1 min-h-[100px]"
                    value={formData.message} onChange={handleInputChange}
                  />
                </div>

                {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
                <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website" name="website" type="text" tabIndex={-1} autoComplete="off"
                    value={formData.website} onChange={handleInputChange}
                  />
                </div>

                {status === 'error' && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                    <p className="font-semibold mb-3">{errorMessage}</p>
                    <div className="flex flex-wrap gap-2">
                      <a href={`tel:${CONTACT_PHONE}`} onClick={() => trackCta('call', 'contact_form_error')}>
                        <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
                          <Phone className="w-4 h-4" /> Call us
                        </Button>
                      </a>
                      <a href={defaultInquirySms} onClick={() => trackCta('text', 'contact_form_error')}>
                        <Button type="button" size="sm" variant="outline" className="gap-1">
                          <MessageSquare className="w-4 h-4" /> Text us
                        </Button>
                      </a>
                    </div>
                  </div>
                )}

                <Button
                  type="submit" size="lg" disabled={status === 'sending'}
                  className="w-full text-lg py-6 mt-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  {status === 'sending' ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-5 h-5 mr-2" /> Send Inquiry</>
                  )}
                </Button>
              </form>
              )}

            </div>
          </div>
          <p className="mt-12 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Aama Day Care Center ·{" "}
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Contact;
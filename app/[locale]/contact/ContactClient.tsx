"use client";

import { useState } from "react";
import DateInput from "@/components/ui/DateInput";

interface ContactTranslations {
  title: string;
  subtitle: string;
  name: string;
  namePlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  weddingDate: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  submitError: string;
  genericError: string;
  successTitle: string;
  successMessage: string;
  goHome: string;
  contactInfo: string;
  businessHours: string;
  weekdays: string;
  weekends: string;
  inquiryNote: string;
}

interface ContactClientProps {
  translations: ContactTranslations;
  locale: string;
}

export default function ContactClient({ translations, locale }: ContactClientProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    weddingDate: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || translations.submitError);
      }

      setIsSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : translations.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isSubmitted) {
    const successLines = translations.successMessage.split("\n");
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <svg
              className="h-8 w-8 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-bold">{translations.successTitle}</h1>
          <p className="mb-8 text-muted-foreground">
            {successLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < successLines.length - 1 && <br />}
              </span>
            ))}
          </p>
          <a
            href={`/${locale}`}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-white transition-all hover:bg-accent-hover"
          >
            {translations.goHome}
          </a>
        </div>
      </div>
    );
  }

  const subtitleLines = translations.subtitle.split("\n");

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">{translations.title}</h1>
          <p className="text-lg text-muted-foreground mobile-br-hidden">
            {subtitleLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < subtitleLines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                {translations.name} <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder={translations.namePlaceholder}
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium"
              >
                {translations.phone} <span className="text-accent">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder={translations.phonePlaceholder}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                {translations.email}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder={translations.emailPlaceholder}
              />
            </div>
            <div>
              <label
                htmlFor="weddingDate"
                className="mb-2 block text-sm font-medium"
              >
                {translations.weddingDate}
              </label>
              <DateInput
                id="weddingDate"
                name="weddingDate"
                value={formData.weddingDate}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-medium"
            >
              {translations.message} <span className="text-accent">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              placeholder={translations.messagePlaceholder}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-accent py-4 text-base font-medium text-white transition-all hover:bg-accent-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSubmitting ? translations.submitting : translations.submit}
          </button>
        </form>

        {/* Contact Info */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted p-6">
            <h3 className="mb-4 font-medium">{translations.contactInfo}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                contact@rauvfilm.co.kr
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                010-0000-0000
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-muted p-6">
            <h3 className="mb-4 font-medium">{translations.businessHours}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{translations.weekdays}</li>
              <li>{translations.weekends}</li>
              <li className="pt-2 text-xs">
                {translations.inquiryNote}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

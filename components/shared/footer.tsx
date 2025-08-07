'use client';

import { Container } from '@/components/shared';
import { cn } from '@/lib/utils';
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  Github,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface Props {
  className?: string;
}

export const Footer: React.FC<Props> = ({ className }) => {
  const currentYear = new Date().getFullYear();
  const [isNavOpen, setIsNavOpen] = useState(false); // State for collapsible navigation

  return (
    <footer
      className={cn('bg-background border-t border-border', className)}
      role="region"
      aria-label="Footer"
    >
      <Container className="py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center sm:justify-items-start">
          {/* Brand Section */}
          <div className="flex flex-col items-center sm:items-start max-w-xs mx-auto sm:mx-0">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image
                className="dark:invert brightness-0"
                src="/logo.png"
                alt="Logo"
                width={28}
                height={28}
                priority
              />
              <h2 className="text-xl sm:text-2xl uppercase font-sans font-black text-foreground">
                Crossy
              </h2>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left px-10 sm:px-0">
              Discover the best sneakers with Crossy. Style, comfort, and
              quality in every step.
            </p>
          </div>

          {/* Navigation Links (Collapsible on Mobile) */}
          <div className="flex flex-col items-center sm:items-start">
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="flex items-center justify-center sm:justify-start w-full text-lg font-semibold text-foreground mb-3 sm:mb-4 lg:cursor-default"
            >
              Explore
              <span className="lg:hidden ml-2">
                {isNavOpen ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </span>
            </button>
            <ul
              className={cn('space-y-2 w-full text-center sm:text-left', {
                'hidden lg:block': !isNavOpen,
              })}
            >
              {[
                { name: 'Catalog', href: '/' },
                { name: 'Cart', href: '/cart' },
                { name: 'Favorites', href: '/favorites' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors block py-1 px-2 touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-lg font-semibold text-foreground mb-3 sm:mb-4 text-center sm:text-left">
              Contact Me
            </h3>
            <ul className="space-y-2 w-full text-center sm:text-left">
              <li className="flex flex-row items-center justify-center sm:justify-start gap-2">
                <Mail
                  size={14}
                  className="text-muted-foreground flex-shrink-0"
                />
                <a
                  href="mailto:stamalex2000@gmail.com"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors block py-1 px-2 touch-manipulation"
                >
                  stamalex2000@gmail.com
                </a>
              </li>
              <li className="flex flex-row items-center justify-center sm:justify-start gap-2">
                <Phone
                  size={14}
                  className="text-muted-foreground flex-shrink-0"
                />
                <a
                  href="tel:+37369388550"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors block py-1 px-2 touch-manipulation"
                >
                  +373 693 88 550
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-lg font-semibold text-foreground mb-3 sm:mb-4 text-center sm:text-left">
              Follow Me
            </h3>
            <div className="flex gap-3 justify-center sm:justify-start">
              {[
                {
                  name: 'GitHub',
                  href: 'https://github.com/stama1ex',
                  icon: (
                    <Github
                      size={20}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    />
                  ),
                },
                {
                  name: 'Instagram',
                  href: 'https://www.instagram.com/stama1ex',
                  icon: (
                    <Instagram
                      size={20}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    />
                  ),
                },
                {
                  name: 'Telegram',
                  href: 'https://t.me/stamalex',
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                      fill="currentColor"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <path d="M41.4193 7.30899C41.4193 7.30899 45.3046 5.79399 44.9808 9.47328C44.8729 10.9883 43.9016 16.2908 43.1461 22.0262L40.5559 39.0159C40.5559 39.0159 40.3401 41.5048 38.3974 41.9377C36.4547 42.3705 33.5408 40.4227 33.0011 39.9898C32.5694 39.6652 24.9068 34.7955 22.2086 32.4148C21.4531 31.7655 20.5897 30.4669 22.3165 28.9519L33.6487 18.1305C34.9438 16.8319 36.2389 13.8019 30.8426 17.4812L15.7331 27.7616C15.7331 27.7616 14.0063 28.8437 10.7686 27.8698L3.75342 25.7055C3.75342 25.7055 1.16321 24.0823 5.58815 22.459C16.3807 17.3729 29.6555 12.1786 41.4193 7.30899Z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 touch-manipulation"
                  aria-label={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
            &copy; {currentYear} Crossy. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

import { Link } from 'react-router-dom';
import { Home, ExternalLink, Linkedin, Twitter, Github, Youtube } from 'lucide-react';
import { Flag } from '../ui/Flag';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <img
                src="/placesi-logo-dark copy.png"
                alt="Placesi"
                className="h-7 dark:hidden"
                style={{ width: 'auto', imageRendering: 'crisp-edges' }}
              />
              <img
                src="/placesi-logo-white copy.png"
                alt="Placesi"
                className="h-7 hidden dark:block"
                style={{ width: 'auto', imageRendering: 'crisp-edges' }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered Caribbean real estate platform connecting buyers, agents, and banks.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Flag countryCode="tt" size="sm" title="Trinidad and Tobago" />
              <span className="text-xs text-gray-500 dark:text-gray-500">Proudly serving Trinidad & Tobago</span>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/chat" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-1">
                  AI Search
                  <ExternalLink className="w-3 h-3 dark:text-green-500" />
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-1">
                  Browse Properties
                  <ExternalLink className="w-3 h-3 dark:text-green-500" />
                </Link>
              </li>
              <li>
                <Link to="/agents" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-1">
                  Find Agents
                  <ExternalLink className="w-3 h-3 dark:text-green-500" />
                </Link>
              </li>
              <li>
                <Link to="/mortgage" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-1">
                  Get Pre-Approved
                  <ExternalLink className="w-3 h-3 dark:text-green-500" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/signup?role=agent" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  For Agents
                </Link>
              </li>
              <li>
                <Link to="/signup?role=agency" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  For Agencies
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Social</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-2">
                  <Linkedin className="w-4 h-4 dark:text-green-500" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-2">
                  <Twitter className="w-4 h-4 dark:text-green-500" />
                  Twitter/X
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-2">
                  <Youtube className="w-4 h-4 dark:text-green-500" />
                  YouTube
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center gap-2">
                  <Github className="w-4 h-4 dark:text-green-500" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-sm text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} Placesi - All rights reserved. Powered by Forsmon Technologies Limited.</p>
        </div>
      </div>
    </footer>
  );
}

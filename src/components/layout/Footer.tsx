import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BiLogoYoutube,
  BiLogoTwitter,
  BiLogoFacebook,
  BiLogoTiktok,
  BiChevronRight,
  BiMap,
  BiPhone,
  BiEnvelope,
} from 'react-icons/bi'
import { FooterCategories } from './FooterCategories'
import { FooterRecentPosts } from './FooterRecentPosts'
import { FooterNewsletter } from './FooterNewsletter'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="mb-4 sm:mb-6">
              <Image
                src="/logo.png"
                alt="Dawan TV"
                width={140}
                height={42}
                priority
                className="mb-3 sm:mb-4 w-auto h-[36px] sm:h-[42px]"
              />
              <p className="text-slate-300 text-sm max-w-xs">
                Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya iyo Geeska Afrika
              </p>
            </div>

            <div className="flex flex-col space-y-2 sm:space-y-3 text-slate-300 text-sm">
              <div className="flex items-center">
                <BiMap className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-[#b01c14]" />
                <span>Marinio Rd, Mogadishu, Somalia</span>
              </div>
              <div className="flex items-center">
                <BiPhone className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-[#b01c14]" />
                <span>+252628881171</span>
              </div>
              <div className="flex items-center">
                <BiEnvelope className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-[#b01c14]" />
                <span>Info@dawan.so</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 flex space-x-3 sm:space-x-4">
              <a
                href="https://www.youtube.com/channel/UCI0ALvkEN9VQwbvmIMHcbvQ"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 p-1.5 sm:p-2 rounded-full hover:bg-[#b01c14] transition-colors"
              >
                <BiLogoYoutube className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="https://x.com/dawan_tv"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 p-1.5 sm:p-2 rounded-full hover:bg-[#b01c14] transition-colors"
              >
                <BiLogoTwitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="https://www.facebook.com/Dawantv/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 p-1.5 sm:p-2 rounded-full hover:bg-[#b01c14] transition-colors"
              >
                <BiLogoFacebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@dawan_tv"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 p-1.5 sm:p-2 rounded-full hover:bg-[#b01c14] transition-colors"
              >
                <BiLogoTiktok className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          <div className="hidden sm:block sm:col-span-1 lg:col-span-2">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-white relative pb-2 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-10 sm:before:w-12 before:h-0.5 before:bg-[#b01c14]">
              Xiriirro Degdeg ah
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-300 hover:text-[#b01c14] transition-colors flex items-center"
                >
                  <BiChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                  Bogga Hore
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-slate-300 hover:text-[#b01c14] transition-colors flex items-center"
                >
                  <BiChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                  Wararkii Ugu Dambeeyay
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-300 hover:text-[#b01c14] transition-colors flex items-center"
                >
                  <BiChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                  Nagu Saabsan
                </Link>
              </li>
            </ul>
          </div>

          <FooterCategories />

          <FooterRecentPosts />
        </div>

        <FooterNewsletter />

        <div className="border-t border-slate-800 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-slate-400 text-xs sm:text-sm">
            &copy; {currentYear} Dawan TV. Dhammaan xuquuqaha waa la dhowray.
          </p>
          <p className="text-slate-500 text-xs mt-2 sm:mt-0">
            Designed and Developed by{' '}
            <a
              href="https://www.kulmi.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b01c14] hover:text-[#b01c14]/80 transition-colors"
            >
              Kulmi Digital
            </a>
          </p>
          <div className="mt-4 sm:mt-0 flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link
              href="/privacy-policy"
              className="text-slate-400 hover:text-[#b01c14] text-xs sm:text-sm"
            >
              Siyaasadda Arrimaha Gaarka ah
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-[#b01c14] text-xs sm:text-sm">
              Shuruudaha Adeegga
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

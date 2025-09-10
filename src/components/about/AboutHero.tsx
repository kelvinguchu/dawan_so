import React from 'react'
import { BiBuildings, BiGlobe, BiTargetLock } from 'react-icons/bi'

export const AboutHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden h-screen flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/og-default.png)',
        }}
      />

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                Nagu Saabsan{' '}
                <span className="text-[#b01c14] relative">
                  Dawan TV
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#b01c14] opacity-90 rounded-full shadow-lg shadow-[#b01c14]/50"></div>
                </span>
              </h1>

              <div className="max-w-4xl mx-auto space-y-4">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#b01c14] font-semibold leading-relaxed drop-shadow-md">
                  Warar iyo falanqayn qoto dheer oo ku saabsan Soomaaliya
                </p>
                <p className="text-xs sm:text-sm md:text-base text-gray-100 leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
                  Hay’ad warbaahineed firfircoon oo la aasaasay 2023, diiradda saaraysa Soomaaliya,
                  oo bixisa warar dhammaystiran, falanqayn qoto dheer, iyo sheekooyin dhaqameed muhiim ah.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto mb-6">
            <div className="bg-white/15 backdrop-blur-2xl border border-white/30 rounded-xl p-3 sm:p-4 text-center group hover:bg-white/25 hover:shadow-xl hover:shadow-[#b01c14]/20 hover:border-[#b01c14]/40 transition-all duration-500 hover:scale-105">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#b01c14]/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#b01c14]/30 transition-all duration-300 shadow-lg shadow-[#b01c14]/20">
                <BiGlobe className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#b01c14] drop-shadow-sm" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-white mb-1 drop-shadow-md">
                Madal Badan
              </h3>
              <p className="text-xs text-gray-200 drop-shadow-sm hidden sm:block">
                3 Madal oo Waaweyn
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-2xl border border-white/30 rounded-xl p-3 sm:p-4 text-center group hover:bg-white/25 hover:shadow-xl hover:shadow-[#b01c14]/20 hover:border-[#b01c14]/40 transition-all duration-500 hover:scale-105">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#b01c14]/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#b01c14]/30 transition-all duration-300 shadow-lg shadow-[#b01c14]/20">
                <BiTargetLock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#b01c14] drop-shadow-sm" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-white mb-1 drop-shadow-md">
                Afaf Badan
              </h3>
              <p className="text-xs text-gray-200 drop-shadow-sm hidden sm:block">3 Af</p>
            </div>

            <div className="bg-white/15 backdrop-blur-2xl border border-white/30 rounded-xl p-3 sm:p-4 text-center group hover:bg-white/25 hover:shadow-xl hover:shadow-[#b01c14]/20 hover:border-[#b01c14]/40 transition-all duration-500 hover:scale-105">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#b01c14]/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#b01c14]/30 transition-all duration-300 shadow-lg shadow-[#b01c14]/20">
                <BiBuildings className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#b01c14] drop-shadow-sm" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-white mb-1 drop-shadow-md">
                La Aasaasay
              </h3>
              <p className="text-xs text-gray-200 drop-shadow-sm hidden sm:block">2023</p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b01c14]/20 to-[#b01c14]/10 backdrop-blur-xl border border-[#b01c14]/40 rounded-full shadow-lg shadow-[#b01c14]/30 hover:shadow-xl hover:shadow-[#b01c14]/40 transition-all duration-300">
              <div className="w-1.5 h-1.5 bg-[#b01c14] rounded-full animate-pulse shadow-sm shadow-[#b01c14]/50"></div>
              <span className="text-xs sm:text-sm text-white font-medium drop-shadow-sm">
                La aasaasay 2023 • Soomaaliya
              </span>
              <div className="w-1.5 h-1.5 bg-[#b01c14] rounded-full animate-pulse shadow-sm shadow-[#b01c14]/50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

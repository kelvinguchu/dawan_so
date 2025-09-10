import React from 'react'
import { BiBookOpen, BiAnalyse, BiTrendingUp, BiGroup } from 'react-icons/bi'

export const AboutContent: React.FC = () => {
  const services = [
    {
      icon: <BiBookOpen className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: 'Warar Dhammaystiran',
      description: 'War degdeg ah iyo arrimaha hadda taagan ee Soomaaliya.',
    },
    {
      icon: <BiAnalyse className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: 'Falanqayn Qoto Dheer',
      description:
        'Falanqayn iyo faallo khubaro oo ku saabsan arrimaha siyaasadda, dhaqaalaha iyo bulshada ee Soomaaliya.',
    },
    {
      icon: <BiTrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: 'Aragtiyaha Ganacsiga',
      description: 'Isbeddellada suuqyada, tilmaamayaasha dhaqaalaha, iyo fursadaha ganacsi ee gudaha Soomaaliya.',
    },
    {
      icon: <BiGroup className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: 'Sheekooyinka Dhaqanka',
      description: 'Dhaxal dhaqameed hodan ah, caadooyin iyo sheekooyin qaabeeya bulshada Soomaaliyeed.',
    },
  ]

  return (
    <section className="bg-gray-50 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Hadafkayaga
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Dawan Media Group waa hay’ad warbaahineed firfircoon oo la aasaasay 2023, diiradda
              saaraysa Soomaaliya. Waxaan bixinnaa warar dhammaystiran, falanqayn qoto dheer,
              aragtiyo ganacsi, daboolidda siyaasadda, iyo sheekooyin dhaqameed muhiim ah.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 text-center group"
              >
                <div className="text-[#b01c14] mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-8 sm:p-12 shadow-sm text-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              Aragtiyadeenna
            </h3>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Dawan Media Group waxaannu ka go’an tahay inaan wacyigelinno, ka qaybgelinno oo aan
              isku xirno bulshooyinka. Waxaan aaminsannahay awoodda sheekooyinka dhabtaa ee isku xira
              dhaqamada oo kobciya is-fahamka gudaha Soomaaliya iyo bulshada Soomaaliyeed ee dibadda.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

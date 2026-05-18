import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ShuleYetu
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Taarifa kamili za shule, matokeo ya NECTA, na uchaguzi wa wanafunzi Tanzania
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Link
              href="/orodha/shule"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-6 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Tafuta Shule</h3>
              <p className="text-blue-100">
                Orodha ya shule zote Tanzania kwa mkoa, aina, na ngazi
              </p>
            </Link>
            
            <Link
              href="/matokeo/CSEE/2024"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-6 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Matokeo NECTA</h3>
              <p className="text-blue-100">
                Matokeo ya CSEE, ACSEE, PSLE na mitihani mingine
              </p>
            </Link>
            
            <Link
              href="/uchaguzi/2024"
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-6 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Uchaguzi</h3>
              <p className="text-blue-100">
                Wanafunzi walipoenda baada ya mitihani yao
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Vifungu vya Haraka
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/mchanganyiko"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">Mchanganyiko</h3>
              <p className="text-sm text-gray-500">PCM, HGE, CBG, n.k.</p>
            </Link>
            
            <Link
              href="/vyuo"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">Vyuo</h3>
              <p className="text-sm text-gray-500">Taaluma na kozi</p>
            </Link>
            
            <Link
              href="/biashara"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">Biashara</h3>
              <p className="text-sm text-gray-500">Mafunzo ya ufundi</p>
            </Link>
            
            <Link
              href="/somo"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">Masomo</h3>
              <p className="text-sm text-gray-500">Fizikia, Kemia, n.k.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Takwimu kwa Ufupi
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">~20,000</div>
              <div className="text-gray-500">Shule</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">31</div>
              <div className="text-gray-500">Mikoa</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">~185</div>
              <div className="text-gray-500">Halmashauri</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">~20+</div>
              <div className="text-gray-500">Mchanganyiko</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold">ShuleYetu</span>
              <p className="text-gray-400 text-sm mt-1">
                Taarifa za elimu Tanzania
              </p>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/kunhusu" className="hover:text-white">Kunhusu</Link>
              <Link href="/wasiliana" className="hover:text-white">Wasiliana</Link>
              <Link href="/sharti" className="hover:text-white">Sharti</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

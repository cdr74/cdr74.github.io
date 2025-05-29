import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, Zap, Settings, AlertTriangle, Gauge, FuelIcon as Engine } from "lucide-react"

export default function Component() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Engine className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-white">125cc Tuning Guide</h1>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#motor" className="text-slate-300 hover:text-orange-500 transition-colors">
                Motor
              </a>
              <a href="#auspuff" className="text-slate-300 hover:text-orange-500 transition-colors">
                Auspuff
              </a>
              <a href="#vergaser" className="text-slate-300 hover:text-orange-500 transition-colors">
                Vergaser
              </a>
              <a href="#tipps" className="text-slate-300 hover:text-orange-500 transition-colors">
                Tipps
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              125cc Motorrad <span className="text-orange-500">Tuning</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Entdecke die Geheimnisse des 125cc Motorrad-Tunings. Von Motoroptimierung bis hin zu Auspuffanlagen - hier
              findest du alles, was du brauchst, um das Maximum aus deinem Bike herauszuholen.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-lg py-2 px-4">
                <Zap className="w-4 h-4 mr-2" />
                Mehr Leistung
              </Badge>
              <Badge variant="secondary" className="text-lg py-2 px-4">
                <Gauge className="w-4 h-4 mr-2" />
                Bessere Performance
              </Badge>
              <Badge variant="secondary" className="text-lg py-2 px-4">
                <Settings className="w-4 h-4 mr-2" />
                Professionelle Tipps
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Motor Tuning */}
            <Card id="motor" className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Engine className="h-6 w-6 text-orange-500" />
                  <CardTitle className="text-white">Motor Tuning</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Optimiere deinen 125cc Motor für maximale Leistung
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Zylinderkopf bearbeiten:</strong> Kanäle glätten und polieren für besseren Luftstrom
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Kolben upgraden:</strong> Leichtere Kolben für höhere Drehzahlen
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Nockenwelle:</strong> Sportnocken für aggressivere Steuerzeiten
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Verdichtung erhöhen:</strong> Dünnere Kopfdichtung oder Kopf fräsen
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Auspuff System */}
            <Card id="auspuff" className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-orange-500" />
                  <CardTitle className="text-white">Auspuffanlage</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Der richtige Auspuff macht den Unterschied</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Sport-Auspuff:</strong> Akrapovic, Arrow oder LeoVince für mehr Power
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Krümmer optimieren:</strong> Längere oder kürzere Rohre je nach Einsatzbereich
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>DB-Killer entfernen:</strong> Nur für Rennstrecke! Straße illegal
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Abstimmung:</strong> Nach Auspuffwechsel Vergaser neu einstellen
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Vergaser Tuning */}
            <Card id="vergaser" className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-6 w-6 text-orange-500" />
                  <CardTitle className="text-white">Vergaser Setup</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Perfekte Kraftstoff-Luft-Mischung einstellen
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Hauptdüse:</strong> Größere Düse bei Sport-Auspuff (meist +2-4 Nummern)
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Nadel verstellen:</strong> Position für mittleren Drehzahlbereich anpassen
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Leerlaufdüse:</strong> Für sauberen Leerlauf und gute Gasannahme
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Luftfilter:</strong> Sport-Luftfilter für bessere Atmung
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Fahrwerk */}
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Gauge className="h-6 w-6 text-orange-500" />
                  <CardTitle className="text-white">Fahrwerk</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Handling und Optik verbessern</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Tieferlegung:</strong> 2-4cm für sportlichere Optik
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Sport-Federbeine:</strong> Bessere Dämpfung und Einstellbarkeit
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Reifen:</strong> Sportmischung für besseren Grip
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Bremsen:</strong> Stahlflex-Leitungen und Sport-Bremsbeläge
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Elektronik */}
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-orange-500" />
                  <CardTitle className="text-white">Elektronik</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Zündung und elektrische Komponenten</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>CDI-Tuning:</strong> Offene CDI für höhere Drehzahlen
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Zündkerze:</strong> Kältere Kerze bei höherer Verdichtung
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Zündspule:</strong> Hochleistungsspule für stärkeren Funken
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Kabelbaum:</strong> Alle Verbindungen prüfen und reinigen
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Optik Tuning */}
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Wrench className="h-6 w-6 text-orange-500" />
                  <CardTitle className="text-white">Optik & Style</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Individueller Look für dein Bike</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Verkleidung:</strong> Sport-Vollverkleidung oder Naked-Bike-Look
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Felgen:</strong> Leichtmetallfelgen in verschiedenen Designs
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>LED-Beleuchtung:</strong> Moderne LED-Scheinwerfer und Blinker
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>
                      <strong>Lackierung:</strong> Custom-Paint oder Folierung
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section id="tipps" className="py-16 px-4 bg-slate-900/50">
        <div className="container mx-auto">
          <Card className="bg-red-900/20 border-red-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <CardTitle className="text-white">Wichtige Hinweise & Rechtliches</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-slate-300">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">⚠️ Sicherheit geht vor</h4>
                  <ul className="space-y-2">
                    <li>• Alle Arbeiten nur mit entsprechendem Fachwissen durchführen</li>
                    <li>• Bei Unsicherheit immer einen Fachmann konsultieren</li>
                    <li>• Schutzausrüstung beim Arbeiten am Motor tragen</li>
                    <li>• Motor vor Arbeiten vollständig abkühlen lassen</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">📋 Rechtliche Aspekte</h4>
                  <ul className="space-y-2">
                    <li>• Viele Tuning-Maßnahmen führen zum Erlöschen der Betriebserlaubnis</li>
                    <li>• 125cc Bikes sind auf 15 PS (11 kW) begrenzt</li>
                    <li>• Änderungen müssen eingetragen oder abgenommen werden</li>
                    <li>• Bei Verstößen drohen Bußgelder und Stilllegung</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tools & Equipment */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Benötigte Werkzeuge & Ausrüstung</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Grundausstattung</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-2">
                  <li>• Steckschlüsselsatz (8-19mm)</li>
                  <li>• Schraubendreher-Set</li>
                  <li>• Drehmomentschlüssel</li>
                  <li>• Zündkerzenschlüssel</li>
                  <li>• Multimeter</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Spezialwerkzeug</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-2">
                  <li>• Kolbenringzange</li>
                  <li>• Ventilfedern-Spanner</li>
                  <li>• Kompressionsmesser</li>
                  <li>• Synchronisiergerät</li>
                  <li>• Abzieher-Set</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Verbrauchsmaterial</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <ul className="space-y-2">
                  <li>• Motoröl (10W-40 oder 15W-50)</li>
                  <li>• Dichtungen und O-Ringe</li>
                  <li>• Schraubensicherung</li>
                  <li>• Reinigungsmittel</li>
                  <li>• Schmierfett</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-slate-700 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Engine className="h-6 w-6 text-orange-500" />
            <span className="text-white font-semibold">125cc Tuning Guide</span>
          </div>
          <p className="text-slate-400 mb-4">
            Alle Informationen dienen nur zu Bildungszwecken. Tuning erfolgt auf eigene Verantwortung.
          </p>
          <p className="text-slate-500 text-sm">© 2024 125cc Tuning Guide. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  )
}

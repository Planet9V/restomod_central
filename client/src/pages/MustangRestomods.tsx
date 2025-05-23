import React from "react";
import { motion } from "framer-motion";
import { Tilt } from "react-tilt";
import { ChevronRight, Wrench, Gauge, DollarSign, ArrowRight, Wrench as EngineIcon } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import { TypewriterSpecs } from "@/components/animations/TypewriterSpecs";

// Premium Tilt Options
const tiltOptions = {
  max: 10,
  scale: 1.05,
  speed: 1000,
  glare: true,
  "max-glare": 0.2,
};

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Key specs with typewriter effect data
const keySpecifications = [
  { title: "Engine Output", value: "412-650+ horsepower" },
  { title: "Torque", value: "390-550+ lb-ft" },
  { title: "Quarter Mile", value: "11.3-11.6 seconds" },
  { title: "Weight Distribution", value: "Near 50/50 balance" },
  { title: "Weight Savings", value: "50-80 pounds lighter" },
];

// The most popular modifications for classic Mustangs
const popularModifications = [
  {
    title: "Coyote Engine Swap",
    description: "Modern 5.0L V8 with 412-460+ HP and fuel injection for reliability and power",
    icon: EngineIcon,
    image: "https://images.unsplash.com/photo-1621447980929-6515fd35d548?q=80&w=800&auto=format&fit=crop",
    price: "$12,000-18,000"
  },
  {
    title: "Modern Suspension",
    description: "Tubular front suspension, coil-overs, rack & pinion steering for modern handling",
    icon: Wrench,
    image: "https://images.unsplash.com/photo-1562519819-016930ada31c?q=80&w=800&auto=format&fit=crop",
    price: "$3,500-8,000"
  },
  {
    title: "Brake Upgrades",
    description: "Four-wheel disc brakes with power assist for modern stopping power",
    icon: Gauge,
    image: "https://images.unsplash.com/photo-1594009598304-c0c86a404b4e?q=80&w=800&auto=format&fit=crop",
    price: "$2,000-4,500"
  },
  {
    title: "Transmission Upgrades",
    description: "Modern 6-speed manual or 10-speed automatic transmission",
    icon: Wrench,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop",
    price: "$4,500-7,500"
  },
  {
    title: "Interior Technology",
    description: "Modern gauges, audio systems, and climate control with vintage aesthetics",
    icon: DollarSign,
    image: "https://images.unsplash.com/photo-1616788494698-ef39094dec07?q=80&w=800&auto=format&fit=crop",
    price: "$3,000-15,000"
  }
];

// Investment Value and Market Trends
const investmentData = [
  { year: "2010", value: 100 },
  { year: "2012", value: 118 },
  { year: "2014", value: 135 },
  { year: "2016", value: 156 },
  { year: "2018", value: 187 },
  { year: "2020", value: 225 },
  { year: "2022", value: 278 },
  { year: "2024", value: 312 },
];

const MustangRestomods = () => {
  return (
    <>
      <PageHeader
        title="1960s Ford Mustang Restomods"
        subtitle="The Ultimate Guide to Coyote-Powered Classic Mustangs"
        imageSrc="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop"
      />

      <main className="bg-offwhite text-charcoal">
        {/* Introduction Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="prose prose-lg mx-auto"
            >
              <p className="text-xl font-medium">
                The 1960s Ford Mustang represents the pinnacle of American automotive design and continues to be one of the most coveted vehicles for restomod projects.
              </p>
              <p>
                This comprehensive guide will explore how to transform a classic 1967-1969 Mustang with modern performance capabilities while maintaining its timeless aesthetic appeal. The centerpiece of our approach is the Ford Coyote 5.0L V8 engine swap, which delivers exceptional power, reliability, and driving dynamics.
              </p>
              <div className="not-prose">
                <TypewriterSpecs specifications={keySpecifications} />
              </div>
            </motion.div>

            <motion.div 
              className="mt-16 md:mt-24"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <Tilt options={tiltOptions} className="w-full overflow-hidden rounded-sm shadow-xl bg-white">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop"
                    alt="Ford Mustang Restomod"
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <h2 className="text-2xl md:text-4xl font-playfair text-white mb-2 md:mb-4">
                      Combining Timeless Design with Modern Performance
                    </h2>
                    <p className="text-white/90 max-w-3xl">
                      The Coyote engine swap delivers more than just raw power—it represents a comprehensive transformation that enhances every aspect of the classic Mustang experience.
                    </p>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          </div>
        </section>

        {/* Key Components Section */}
        <section className="py-16 md:py-24 bg-charcoal text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-playfair mb-4">
                Key Components for the Ultimate Mustang Restomod
              </h2>
              <p className="max-w-3xl mx-auto text-white/80">
                Creating a premium Mustang restomod requires careful planning and selection of components that work together harmoniously. Here are the critical elements for a successful build.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {popularModifications.map((mod, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-sm rounded-sm overflow-hidden border border-white/10 hover:border-burgundy/40 transition-colors duration-300"
                >
                  <div className="h-52 overflow-hidden">
                    <img
                      src={mod.image}
                      alt={mod.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4 text-burgundy">
                      <mod.icon className="w-5 h-5 mr-2" />
                      <h3 className="font-playfair text-xl text-white">{mod.title}</h3>
                    </div>
                    <p className="text-white/70 mb-4">{mod.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <span className="text-sm text-white/60">Typical Investment</span>
                      <span className="text-burgundy font-medium">{mod.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Button variant="outline" className="text-white border-white hover:bg-white/10">
                Download Complete Component Guide <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Technical Challenges Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-playfair mb-6">
                  Overcoming Technical Challenges
                </h2>
                <div className="space-y-6 text-charcoal/80">
                  <p>
                    The Coyote engine's 27.5-inch width presents the first major challenge when fitting it into a classic Mustang chassis designed for narrower powerplants. This requires careful consideration of motor mount solutions, with options like the Ford Performance M-6038-M50 kit or aftermarket alternatives from Hooker Blackheart.
                  </p>
                  <p>
                    Oil pan clearance is another significant concern, especially with lowered suspension setups. The factory Mustang GT oil pan often interferes with the steering linkage and crossmember. Solutions include specialized road race oil pans or custom modifications.
                  </p>
                  <p>
                    Modern engine management systems require integration with classic wiring harnesses. This means addressing PCM mounting, power distribution, and ground connections. Standalone harnesses from specialized providers offer plug-and-play solutions.
                  </p>
                  <p>
                    Transmission selection is critical to both performance and drivability. Options range from modern 6-speed manual transmissions like the Tremec T56 Magnum to sophisticated 10-speed automatics, each requiring appropriate crossmembers, driveshafts, and hydraulic systems.
                  </p>
                </div>
                <div className="mt-8">
                  <Button>
                    Consult Our Technical Team <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-burgundy opacity-20 rounded-sm"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-burgundy opacity-10 rounded-sm"></div>
                  <div className="relative rounded-sm overflow-hidden shadow-xl">
                    <img
                      src="https://images.unsplash.com/photo-1566024435079-4daea68e6798?q=80&w=800&auto=format&fit=crop"
                      alt="Engine bay of a Ford Mustang restomod"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Investment Value Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-charcoal to-charcoal/90 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-playfair mb-4">
                Investment Potential
              </h2>
              <p className="max-w-3xl mx-auto text-white/80">
                Beyond the driving experience, properly executed 1960s Mustang restomods have demonstrated impressive financial appreciation over time.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="space-y-6 text-white/80"
              >
                <p>
                  Premium restomods built on iconic platforms like the 1967-1969 Mustang have shown average annual appreciation of 12-15% over the past five years, substantially outperforming both stock restorations and many traditional investment vehicles.
                </p>

                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-sm border border-white/10">
                  <h3 className="font-playfair text-xl text-white mb-4">Value Drivers</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="inline-block w-6 h-6 rounded-full bg-burgundy/20 flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                        <span className="w-2 h-2 bg-burgundy rounded-full"></span>
                      </span>
                      <span>Build quality and attention to detail</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-6 h-6 rounded-full bg-burgundy/20 flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                        <span className="w-2 h-2 bg-burgundy rounded-full"></span>
                      </span>
                      <span>Original body integrity and craftsmanship</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-6 h-6 rounded-full bg-burgundy/20 flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                        <span className="w-2 h-2 bg-burgundy rounded-full"></span>
                      </span>
                      <span>Reputation of the builder or workshop</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-6 h-6 rounded-full bg-burgundy/20 flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                        <span className="w-2 h-2 bg-burgundy rounded-full"></span>
                      </span>
                      <span>Comprehensive documentation and build history</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-6 h-6 rounded-full bg-burgundy/20 flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                        <span className="w-2 h-2 bg-burgundy rounded-full"></span>
                      </span>
                      <span>Tasteful modification choices that enhance usability</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-sm p-6 border border-white/10">
                  <h3 className="font-playfair text-xl text-white mb-6">
                    Mustang Restomod Valuation Trend (2010-2024)
                  </h3>
                  <div className="h-64 relative">
                    <div className="absolute inset-0 flex items-end">
                      {investmentData.map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex-1 h-0 bg-burgundy mr-1 last:mr-0 relative group"
                          initial={{ height: 0 }}
                          whileInView={{ height: `${(item.value / 350) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ 
                            duration: 1, 
                            delay: index * 0.1,
                            ease: "easeOut" 
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-burgundy text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            {item.year}: +{item.value - 100}%
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-white/60 mt-2">
                    {investmentData.map((item, index) => (
                      <div key={index}>{item.year}</div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 bg-white/5 rounded-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70">Average 10-Year ROI:</span>
                      <span className="text-burgundy font-playfair text-xl">+212%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-playfair mb-6">
                Ready to Start Your Mustang Restomod Journey?
              </h2>
              <p className="text-charcoal/80 mb-8">
                At Skinny's Rod and Custom, we specialize in creating exceptional Mustang restomods that combine classic style with modern performance. Contact our team to discuss your vision.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <Button size="lg">
                  Schedule a Consultation
                </Button>
                <Button variant="outline" size="lg">
                  View Our Portfolio
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default MustangRestomods;
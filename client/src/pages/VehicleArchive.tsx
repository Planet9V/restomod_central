import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import VideoHeader from "@/components/layout/VideoHeader";

const VehicleArchive = () => {
  const [selectedCar, setSelectedCar] = useState("mustang1967");

  // Vehicle pricing trend data
  const priceTrendData = {
    mustang1967: [
      { year: 2013, value: 45000, showCar: 120000 },
      { year: 2014, value: 47500, showCar: 128000 },
      { year: 2015, value: 52000, showCar: 142000 },
      { year: 2016, value: 58000, showCar: 165000 },
      { year: 2017, value: 65000, showCar: 195000 },
      { year: 2018, value: 72000, showCar: 220000 },
      { year: 2019, value: 78000, showCar: 245000 },
      { year: 2020, value: 82000, showCar: 265000 },
      { year: 2021, value: 90000, showCar: 295000 },
      { year: 2022, value: 100000, showCar: 325000 },
      { year: 2023, value: 115000, showCar: 375000 },
    ],
    camaro1968: [
      { year: 2013, value: 42000, showCar: 125000 },
      { year: 2014, value: 45000, showCar: 135000 },
      { year: 2015, value: 50000, showCar: 155000 },
      { year: 2016, value: 55000, showCar: 175000 },
      { year: 2017, value: 62000, showCar: 200000 },
      { year: 2018, value: 68000, showCar: 225000 },
      { year: 2019, value: 75000, showCar: 250000 },
      { year: 2020, value: 82000, showCar: 280000 },
      { year: 2021, value: 95000, showCar: 315000 },
      { year: 2022, value: 110000, showCar: 345000 },
      { year: 2023, value: 125000, showCar: 380000 },
    ],
    fordF1001953: [
      { year: 2013, value: 38000, showCar: 110000 },
      { year: 2014, value: 42000, showCar: 125000 },
      { year: 2015, value: 48000, showCar: 145000 },
      { year: 2016, value: 56000, showCar: 175000 },
      { year: 2017, value: 65000, showCar: 205000 },
      { year: 2018, value: 75000, showCar: 235000 },
      { year: 2019, value: 85000, showCar: 260000 },
      { year: 2020, value: 95000, showCar: 290000 },
      { year: 2021, value: 110000, showCar: 325000 },
      { year: 2022, value: 125000, showCar: 360000 },
      { year: 2023, value: 150000, showCar: 400000 },
    ],
    chevyII1966: [
      { year: 2013, value: 25000, showCar: 85000 },
      { year: 2014, value: 28000, showCar: 95000 },
      { year: 2015, value: 32000, showCar: 105000 },
      { year: 2016, value: 38000, showCar: 120000 },
      { year: 2017, value: 45000, showCar: 140000 },
      { year: 2018, value: 52000, showCar: 160000 },
      { year: 2019, value: 60000, showCar: 185000 },
      { year: 2020, value: 68000, showCar: 210000 },
      { year: 2021, value: 78000, showCar: 240000 },
      { year: 2022, value: 90000, showCar: 275000 },
      { year: 2023, value: 105000, showCar: 310000 },
    ],
    fordF11951: [
      { year: 2013, value: 35000, showCar: 100000 },
      { year: 2014, value: 38000, showCar: 115000 },
      { year: 2015, value: 44000, showCar: 135000 },
      { year: 2016, value: 52000, showCar: 160000 },
      { year: 2017, value: 62000, showCar: 190000 },
      { year: 2018, value: 72000, showCar: 225000 },
      { year: 2019, value: 85000, showCar: 255000 },
      { year: 2020, value: 98000, showCar: 285000 },
      { year: 2021, value: 115000, showCar: 320000 },
      { year: 2022, value: 135000, showCar: 365000 },
      { year: 2023, value: 160000, showCar: 410000 },
    ],
  };

  // Detailed vehicle information
  const vehicleData = {
    mustang1967: {
      name: "1967 Ford Mustang Fastback",
      tagline: "The Iconic American Pony Car",
      mainImage: "https://images.luxuryautodirect.com/19997/1967-ford-mustang-restomod-3.jpg",
      galleryImages: [
        "https://images.luxuryautodirect.com/19997/1967-ford-mustang-restomod-4.jpg",
        "https://images.luxuryautodirect.com/19997/1967-ford-mustang-restomod-6.jpg",
        "https://images.luxuryautodirect.com/19997/1967-ford-mustang-restomod-5.jpg",
        "https://assets.hemmings.com/blog/wp-content/uploads//2018/11/ring-bros-mustang.jpg"
      ],
      history: {
        introduction: "The 1967 Ford Mustang Fastback is considered by many enthusiasts to be the definitive iteration of the first-generation Mustang. Produced during the golden era of American muscle cars, the 1967 model featured significant styling changes from earlier models and offered a range of powerful engine options, cementing its place in automotive history.",
        styling: "For 1967, Ford gave the Mustang its first major redesign since its 1964 introduction. The car grew slightly in size, with a more aggressive stance, larger engine bay, and refined interior. The fastback roofline, which extends in one smooth line from the roof to the rear deck, created one of the most iconic silhouettes in automotive design. New styling features included concave rear quarter panels, wider stance, redesigned grille, and integrated side scoops.",
        production: "Ford produced approximately 472,121 Mustangs in the 1967 model year, with roughly 71,042 being fastback models. The Mustang was produced at Ford plants in Dearborn, Michigan; San Jose, California; and Metuchen, New Jersey. Each fastback was built on Ford's unibody chassis with a 108-inch wheelbase.",
        popularSpecs: "The 1967 Mustang fastback was offered with several engine options. Base models came with a 200 cubic-inch inline-six producing 120 horsepower, but most fastbacks were ordered with V8 engines. Popular options included the 289 cubic-inch V8 with 200 or 225 horsepower and the top-performing 390 cubic-inch V8 generating 320 horsepower. These could be paired with a three-speed automatic or three- and four-speed manual transmissions.",
        culturalImpact: "The 1967 Mustang Fastback gained further notoriety through its appearance in the 1968 film 'Bullitt,' where Steve McQueen drove a Highland Green 1968 model (with minimal differences from the '67) in what is widely considered one of the greatest car chase scenes in cinema history. The car has since appeared in numerous films, television shows, and video games, making it one of the most recognizable vehicles in popular culture.",
        initialPricing: "When new in 1967, the Mustang Fastback had a base price of approximately $2,698 (about $23,400 in today's dollars), with well-optioned models reaching around $3,500 ($30,400 today). Popular factory options included power steering, power brakes, air conditioning, deluxe interior, and various performance upgrades.",
        collectors: "Today, the 1967 Mustang Fastback is one of the most sought-after classic cars. Original, well-preserved examples can command $60,000 to $100,000, while rare configurations with special options or documented history can exceed $150,000. High-quality restomod versions with modern mechanical components regularly sell for $150,000 to $400,000 depending on the builder reputation and specifications."
      },
      specs: {
        originalEngine: "200ci I6 (120hp), 289ci V8 (200-225hp), 390ci V8 (320hp)",
        restmodOptions: "Ford Coyote 5.0L V8 (460hp), Ford Performance 427ci (535hp), Roush supercharged V8 (775hp)",
        transmission: "Original: 3-speed manual, 4-speed manual, or 3-speed automatic. Restomod: Tremec 5/6-speed manual or modern automatic",
        suspension: "Original: Front independent coil spring with strut-stabilized linkage, rear leaf spring. Restomod: Modern coilover suspensions, rack-and-pinion steering",
        dimensions: "Length: 183.6 inches, Width: 70.9 inches, Height: 51.6 inches, Wheelbase: 108.0 inches",
        weight: "Original: Approximately 2,800-3,100 lbs. Restomod: Varies by build",
        production: "Total 1967 Mustangs: 472,121, Fastback models: 71,042"
      },
      popularOptions: [
        "GT Equipment Group (power disc brakes, larger stabilizer bar, dual exhaust with quad outlets)",
        "Special Handling Package (heavy-duty springs and shocks, larger sway bar)",
        "Deluxe Interior (woodgrain trim, deluxe steering wheel, extra insulation)",
        "SelectAire air conditioning",
        "Power steering",
        "Rally-Pac instrument cluster (tachometer and clock)",
        "Sport Deck rear seat (fold-down)",
        "Tinted glass",
        "Styled steel wheels",
        "Front disc brakes"
      ],
      valueFactors: [
        "Matching numbers (original engine and transmission)",
        "Original color combinations",
        "Documented history and provenance",
        "Rust-free, solid body and floor pans",
        "Factory GT or Deluxe packages",
        "Quality of restoration or restomod work",
        "Original documentation (window sticker, build sheet)",
        "Rare factory options"
      ]
    },
    camaro1968: {
      name: "1968 Chevrolet Camaro",
      tagline: "Chevrolet's Answer to the Mustang",
      mainImage: "https://www.speednik.com/wp-content/blogs.dir/1/files/2020/04/the-great-camaro-debate-first-gen-vs-second-gen-pro-touring-2020-04-13_12-54-36_551288.jpg",
      galleryImages: [
        "https://barrettjacksoncdn.azureedge.net/staging/carlist/items/Fullsize/Cars/211815/211815_Side_Profile_Web.jpg",
        "https://www.motortrend.com/uploads/sites/21/2015/07/1968-chevrolet-camaro-z28-grille.jpg",
        "https://cdn.dealeraccelerate.com/cam/1/10988/691683/1920x1440/1968-chevrolet-camaro",
        "https://s1.cdn.autoevolution.com/images/news/ringbrothers-1968-chevrolet-camaro-the-hawk-steals-the-sema-2019-spotlight-139649_1.jpg"
      ],
      history: {
        introduction: "The 1968 Chevrolet Camaro represented the second year of production for Chevrolet's answer to the Ford Mustang. Building on the successful launch in 1967, the 1968 model received minor but notable refinements while maintaining the performance and style that made it an instant classic in the pony car segment.",
        styling: "The 1968 Camaro retained the first-generation body style with its long hood, short deck proportions and muscular stance. The most visible change for 1968 was the removal of the vent windows in the doors, creating a cleaner side profile. Other updates included revised grille design, new side marker lights (required by federal regulation), and updated interior trim options. The iconic RS (Rally Sport) appearance package remained popular, featuring hidden headlights, revised taillights, and additional exterior trim.",
        production: "Chevrolet produced approximately 235,147 Camaros for the 1968 model year, an increase from the debut year. The cars were built at plants in Norwood, Ohio and Van Nuys, California. Available body styles included the hardtop coupe and convertible, with the coupe representing roughly 80% of production.",
        popularSpecs: "The 1968 Camaro offered a wide range of engines, from the base 230 cubic-inch inline-six producing 140 horsepower to several small-block and big-block V8 options. The Z/28 performance package, which debuted in 1967 as a homologation special for Trans Am racing, featured a high-revving 302 cubic-inch V8 officially rated at 290 horsepower (though actual output was closer to 350 hp). The top regular production engine was the SS396 big-block V8 rated at 375 horsepower. Transmission options included three- and four-speed manuals and the Powerglide automatic.",
        culturalImpact: "The 1968 Camaro helped solidify the model as a true American performance icon. It developed a loyal following among enthusiasts and became a fixture in drag racing, road racing, and later in pro touring builds. While it initially arrived as a response to the Mustang, the Camaro quickly established its own identity and passionate fan base that continues to this day.",
        initialPricing: "When new in 1968, the Camaro had a base price of approximately $2,600 (about $22,000 in today's dollars) for the six-cylinder coupe. The convertible started around $2,850. Adding the SS package cost roughly $300 more, while the Z/28 performance package was a $400 option on top of the base V8 model. Well-equipped SS or Z/28 models could reach $3,800 or more ($32,000 today).",
        collectors: "Today, the 1968 Camaro is highly prized by collectors, particularly Z/28, SS, and RS/SS models. Documented Z/28 models in excellent condition can bring $75,000 to $125,000, while exceptional examples have exceeded $175,000 at auction. SS396 models typically range from $50,000 to $90,000 for quality examples. Restomod versions with modern drivetrains and suspensions often sell between $100,000 and $350,000, with some custom builds from renowned shops exceeding $500,000."
      },
      specs: {
        originalEngine: "230ci I6 (140hp), 250ci I6 (155hp), 302ci V8 Z/28 (290hp), 327ci V8 (210-275hp), 350ci V8 (295hp), 396ci V8 (325-375hp)",
        restmodOptions: "LS3 6.2L V8 (430-525hp), LS7 7.0L V8 (505-625hp), LT4 6.2L Supercharged V8 (650-750hp)",
        transmission: "Original: 3-speed manual, 4-speed manual, 2-speed Powerglide automatic. Restomod: Tremec 5/6-speed manual, modern 8/10-speed automatic",
        suspension: "Original: Front coil springs with unequal-length A-arms, rear leaf springs. Restomod: Detroit Speed Quadra-Link, coilover systems, rack-and-pinion steering",
        dimensions: "Length: 186.0 inches, Width: 72.5 inches, Height: 51.4 inches, Wheelbase: 108.0 inches",
        weight: "Original: Approximately 3,000-3,300 lbs. Restomod: Varies by build",
        production: "Total 1968 Camaros: 235,147, Z/28 models: 7,199"
      },
      popularOptions: [
        "RS Package (hidden headlights, different taillights, exterior trim)",
        "SS Package (big-block engine, upgraded suspension, SS badging)",
        "Z/28 Package (302ci engine, 4-speed transmission, power disc brakes, special suspension)",
        "Custom Interior Package (upgraded upholstery, interior trim, door panels)",
        "Special Instrumentation Package (tachometer, additional gauges)",
        "Deluxe steering wheel",
        "Power steering",
        "Power brakes with front discs",
        "Fold-down rear seat",
        "Limited-slip differential"
      ],
      valueFactors: [
        "Matching numbers drivetrain",
        "Original trim and color combinations",
        "Documented Z/28 or COPO models",
        "Rust-free original sheet metal",
        "Complete documentation (Protect-O-Plate, build sheet)",
        "Factory RS, SS, or Z/28 packages",
        "Quality of restoration or modification",
        "Rare factory options"
      ]
    },
    fordF1001953: {
      name: "1953 Ford F-100 Pickup",
      tagline: "The Iconic American Workhorse",
      mainImage: "https://i.ebayimg.com/images/g/f4wAAOSw36NgnEbh/s-l1600.jpg",
      galleryImages: [
        "https://images.squarespace-cdn.com/content/v1/5eb54c22a4d0c8345679b887/1608042075669-VLO9IZRI5XMCNSDJ6IJ1/Westside-Classics-F100-restomod-4.jpg",
        "https://cdn.barrett-jackson.com/staging/carlist/items/Fullsize/Cars/235777/235777_Front_3-4_Web.jpg",
        "https://i0.wp.com/www.musclecarsandtrucks.com/wp-content/uploads/2020/12/Custom-1955-Ford-F100-V8-Front.jpg",
        "https://cdn1.mecum.com/auctions/fl0120/fl0120-397023/images/1-1573753661627@2x.jpg"
      ],
      history: {
        introduction: "The 1953 Ford F-100 is part of Ford's legendary F-Series trucks, specifically from the second generation produced from 1953 to 1956. This generation represented a significant step forward in pickup truck design, with more modern styling, improved comfort, and better performance. The 1953 model introduced the 'F-100' designation that continues in Ford's truck lineup to this day.",
        styling: "The 1953 F-100 featured a complete redesign from the previous generation, showcasing what became known as the 'Power Pilot' body style. Key design elements included an integrated, one-piece windshield (replacing the two-piece design of earlier models), a wider cab with more glass area for improved visibility, a more modern grille design, and a smoother, more integrated look overall. The fenders flowed more cohesively into the truck's body, creating a unified appearance that was quite advanced for its time. The interior was more car-like and comfortable than previous trucks, reflecting the beginning of the transition of pickups from purely utilitarian vehicles to daily drivers.",
        production: "Ford produced approximately 115,000 F-100 pickups for the 1953 model year. They were manufactured at various Ford plants across the United States, including facilities in Michigan, California, Missouri, and other locations. The F-100 was offered in several variants, including different bed lengths and chassis configurations.",
        popularSpecs: "The standard engine in the 1953 F-100 was the 'Mileage Maker' 215 cubic-inch inline-six cylinder, producing 101 horsepower. Buyers could also opt for the 'Power King' 239 cubic-inch flathead V8, delivering 110 horsepower. Both engines were paired with a manual transmission, typically a three-speed column-shifted manual, though some trucks came with a four-speed manual. The trucks featured a 110-inch wheelbase for the standard model and had a payload capacity of approximately half a ton (1,000 pounds).",
        culturalImpact: "The 1953-1956 F-100 has become one of the most iconic and collectible classic trucks in automotive history. Its distinctive styling, relatively compact size (by modern standards), and straightforward mechanics have made it a favorite among hot-rodders, customizers, and restorers. The 1953 F-100 represents a pivotal moment in truck design when manufacturers began to recognize that trucks could be both functional work vehicles and stylish personal transportation.",
        initialPricing: "When new in 1953, the Ford F-100 had a base price of approximately $1,490 (about $16,200 in today's dollars). Options like the V8 engine, heater, radio, and various exterior and interior upgrades could push the price to around $1,800 or more. As utilitarian vehicles, many were purchased with minimal options for work purposes.",
        collectors: "Today, the 1953 Ford F-100 is highly sought after by collectors and enthusiasts. Original, restored examples in excellent condition typically sell for $35,000 to $60,000, depending on configuration and quality of restoration. However, it's the custom restomod versions that often command the highest prices, with high-end builds from renowned shops regularly fetching $100,000 to $250,000. Some exceptional custom builds with top-tier components, craftsmanship, and design have sold for $300,000 to $400,000 at prestigious auctions."
      },
      specs: {
        originalEngine: "215ci I6 'Mileage Maker' (101hp), 239ci Flathead V8 'Power King' (110hp)",
        restmodOptions: "Ford Coyote 5.0L V8 (460hp), Chevrolet LS3 6.2L V8 (430hp), Ford EcoBoost 3.5L Twin-Turbo V6 (450hp)",
        transmission: "Original: 3-speed or 4-speed manual. Restomod: Modern 4/6/8/10-speed automatic, 5/6-speed manual",
        suspension: "Original: Front I-beam axle with leaf springs, rear leaf springs. Restomod: Independent front suspension, 4-link rear, coilovers",
        dimensions: "Length: 180.0 inches, Width: 76.0 inches, Height: 68.0 inches, Wheelbase: 110.0 inches",
        weight: "Original: Approximately 3,500 lbs. Restomod: Varies by build",
        production: "Total 1953 F-100s: Approximately 115,000"
      },
      popularOptions: [
        "V8 engine upgrade",
        "Four-speed manual transmission",
        "Heater",
        "AM radio",
        "Chrome trim package",
        "Passenger-side windshield wiper and sun visor",
        "Turn signals",
        "Deluxe cab (additional trim and appointments)",
        "Two-tone paint",
        "Heavy-duty suspension"
      ],
      valueFactors: [
        "Body condition and rust-free status",
        "Originality of major components",
        "Completeness of trim and details",
        "Quality of restoration or customization",
        "Documentation and history",
        "Running condition and mechanical integrity",
        "Rarity of factory options",
        "Drivetrain configuration"
      ]
    },
    chevyII1966: {
      name: "1966 Chevrolet Chevy II Nova",
      tagline: "Compact Muscle with Classic Style",
      mainImage: "https://cdn1.mecum.com/auctions/fl0122/fl0122-488549/images/20211021195321-1634862802378@2x.jpg",
      galleryImages: [
        "https://www.rpmnut.com/wp-content/uploads/2020/12/001.jpg",
        "https://cdn.dealeraccelerate.com/ccl/1/11442/464143/1920x1440/1966-chevrolet-nova-chevy-ii-custom-coupe",
        "https://barnfinds.com/wp-content/uploads/2023/03/1966-Chevy-II-Nova-SS.jpg",
        "https://www.streetmusclemag.com/image/2019/02/2019-02-13_21-12-01_604920.jpg"
      ],
      history: {
        introduction: "The 1966 Chevrolet Chevy II Nova represented the first year of the second generation of Chevrolet's compact car lineup, which was introduced in 1962 as a smaller alternative to the full-size Chevrolet models. The 1966 model featured a complete redesign with a more squared-off, rectilinear body style that gave it a more substantial and mature appearance compared to the first generation.",
        styling: "The redesigned 1966 Chevy II Nova featured sharp, clean lines with a boxy yet elegant profile. The design incorporated a longer hood, shorter deck proportions that were becoming popular in American cars of the era. The front end featured a simple horizontal grille with quad headlights, while the rear showcased clean lines with minimal embellishments. The hardtop models, in particular, had an attractive roofline that complemented the car's overall proportions. Inside, the Nova received a more modern dashboard, improved seating, and better materials throughout the cabin.",
        production: "Chevrolet produced approximately 163,300 Chevy II models for the 1966 model year. The Nova SS (Super Sport) package, which was available only on the top-trim Nova 400 Sport Coupe, accounted for around 21,700 of those units. Production took place at several GM plants, including Willow Run in Michigan, Norwood in Ohio, and Van Nuys in California.",
        popularSpecs: "The 1966 Chevy II was available with a range of engine options. The base engine was a 120-horsepower 194 cubic-inch inline-six. Optional engines included a 140-horsepower 230 cubic-inch six and, for the first time in a Nova, a small-block V8 – the 283 cubic-inch V8 producing 195 horsepower. The Nova SS came standard with the 194 six but could be optioned with any available engine, including the V8. Transmission options included a three-speed manual, four-speed manual, or two-speed Powerglide automatic.",
        culturalImpact: "The 1966-1967 Chevy II Nova has become increasingly popular among collectors and customizers for its clean lines, relatively light weight, and compatibility with Chevrolet's vast performance parts ecosystem. While it may not have had the initial cultural impact of its bigger siblings like the Camaro and Chevelle, the Nova has developed a dedicated following for its understated style and performance potential. The platform's simplicity and the ease with which it can accept larger, more powerful engines have made it a favorite in the restomod community.",
        initialPricing: "When new in 1966, the Chevy II had a base price of approximately $2,100 (about $18,800 in today's dollars) for the entry-level 100 series. The Nova 400 series started around $2,300, while adding the SS package to a Nova 400 Sport Coupe cost an additional $159. A fully optioned Nova SS with the V8 engine and desirable options could reach $3,000 or more ($26,800 today).",
        collectors: "Today, the 1966 Chevy II Nova has strong appeal among collectors, particularly SS models and those equipped with V8 engines. Standard six-cylinder Novas in excellent condition typically sell for $20,000 to $35,000. Original SS models with the 283 V8 can bring $40,000 to $75,000 depending on condition, documentation, and originality. However, the most valuable examples are well-executed restomods, which regularly sell for $75,000 to $175,000, with exceptional builds from top builders reaching $200,000 to $275,000."
      },
      specs: {
        originalEngine: "194ci I6 (120hp), 230ci I6 (140hp), 283ci V8 (195hp)",
        restmodOptions: "Chevrolet LS3 6.2L V8 (430-525hp), LS7 7.0L V8 (505-615hp), supercharged LS9/LT4 (638-750hp)",
        transmission: "Original: 3-speed manual, 4-speed manual, 2-speed Powerglide automatic. Restomod: Tremec 5/6-speed manual, modern 4L60E/4L80E/6L80E automatic",
        suspension: "Original: Front coil springs with control arms, rear leaf springs. Restomod: Detroit Speed front subframe, four-link rear, coilovers",
        dimensions: "Length: 183.0 inches, Width: 71.0 inches, Height: 54.5 inches, Wheelbase: 110.0 inches",
        weight: "Original: Approximately 2,700-2,900 lbs. Restomod: Varies by build",
        production: "Total 1966 Chevy II models: 163,300, Nova SS models: 21,700"
      },
      popularOptions: [
        "Super Sport (SS) package",
        "V8 engine upgrade",
        "Four-speed manual transmission",
        "Power steering",
        "Power brakes",
        "Factory tachometer",
        "Deluxe interior",
        "Positraction rear differential",
        "Heavy-duty suspension",
        "AM radio"
      ],
      valueFactors: [
        "SS documentation and authenticity",
        "V8 vs. six-cylinder configuration",
        "Matching numbers drivetrain",
        "Rust-free original body",
        "Documentation and ownership history",
        "Original interior condition",
        "Factory color combination",
        "Quality of restoration or modification",
        "Rare factory options"
      ]
    },
    fordF11951: {
      name: "1951 Ford F1 Pickup",
      tagline: "The First F-Series Generation",
      mainImage: "https://notoriousluxury.com/wp-content/uploads/2021/09/1951-Ford-F1.jpg",
      galleryImages: [
        "https://journal.classiccars.com/media/2022/01/restomod-1951-ford-f1-pickup-mecum-4.jpg",
        "https://cdn1.mecum.com/auctions/kc1019/kc1019-399553/images/1-1570559517302@2x.jpg",
        "https://cdn1.mecum.com/auctions/fl0122/fl0122-506093/images/1-1641835972847@2x.jpg",
        "https://cdn1.mecum.com/auctions/an1121/an1121-478834/images/img-2174-1630361306602@2x.jpg"
      ],
      history: {
        introduction: "The 1951 Ford F1 pickup belongs to the first generation of Ford's iconic F-Series trucks, which were produced from 1948 to 1952. This generation marked a major milestone for Ford, as it was the company's first all-new postwar vehicle design and the first dedicated truck platform separate from their car lineup. The 1951 model, in particular, represented a refined version of this groundbreaking design with minor updates and improvements over the initial 1948 introduction.",
        styling: "The 1951 F1 featured what Ford called the 'Million Dollar Cab,' which emphasized comfort and styling alongside utility. The design was characterized by its prominent, five-bar horizontal grille, integrated headlights, and flowing fenders that were more incorporated into the body than pre-war designs. The cabin offered significantly more space, comfort, and visibility than previous Ford trucks, with a wide, three-person bench seat, large glass areas, and improved ventilation. The overall appearance was substantial and purposeful, reflecting post-war America's growing prosperity and the increasing importance of trucks for both work and personal use.",
        production: "Ford produced approximately 254,000 F-Series trucks in 1951 across all variants (F1 through F8), with the F1 half-ton model representing a significant portion of this total. These trucks were manufactured at multiple Ford plants across the United States. The F1 was available in several configurations, including different bed lengths and chassis options to accommodate various work needs.",
        popularSpecs: "The standard engine in the 1951 F1 was a 226 cubic-inch flathead six-cylinder producing 95 horsepower. Buyers could also opt for the more powerful 239 cubic-inch flathead V8, which delivered 100 horsepower. Both engines were paired with a three-speed manual transmission with a floor-mounted shifter. The truck featured a solid front axle with leaf springs and rear leaf springs as well, providing a sturdy if somewhat stiff ride. Four-wheel drum brakes were standard equipment. The trucks had a 114-inch wheelbase and a payload capacity of approximately 1,400-1,500 pounds.",
        culturalImpact: "The first-generation F-Series trucks have become true automotive icons, representing the beginning of America's long-running love affair with pickup trucks. The 1951 F1, with its classic styling and historical significance, is widely recognized as a design milestone and has been featured in countless movies, television shows, and advertisements as the quintessential vintage American pickup. Its simple, rugged construction and timeless design have made it a favorite among both traditional restorers and custom builders looking to blend classic style with modern performance.",
        initialPricing: "When new in 1951, the Ford F1 had a base price of approximately $1,270 (about $14,000 in today's dollars). Optional features like the V8 engine, heater, improved interior trim, and chrome accessories could push the price to around $1,500 or more. As primarily work vehicles, many were purchased with minimal options for commercial and agricultural use.",
        collectors: "Today, the 1951 Ford F1 is a prized collector vehicle with strong and growing market appeal. Original, restored examples in excellent condition typically sell for $30,000 to $50,000, depending on originality and quality of restoration. However, it's the custom restomod versions that often achieve the highest prices, with well-executed builds featuring modern drivetrains, suspensions, and comfort features regularly bringing $80,000 to $200,000. Exceptional restomod builds by renowned builders have exceeded $300,000 at major auctions, placing them among the most valuable vintage trucks in the market."
      },
      specs: {
        originalEngine: "226ci Flathead I6 (95hp), 239ci Flathead V8 (100hp)",
        restmodOptions: "Ford Coyote 5.0L V8 (460hp), Ford 302ci/351ci Windsor V8 (345-450hp), Chevrolet LS3 6.2L V8 (430hp)",
        transmission: "Original: 3-speed manual. Restomod: Modern 4/6-speed automatic, 5-speed manual",
        suspension: "Original: Front and rear leaf springs with solid axles. Restomod: Independent front suspension, four-link rear with coilovers",
        dimensions: "Length: 188.0 inches, Width: 75.9 inches, Height: 74.0 inches, Wheelbase: 114.0 inches",
        weight: "Original: Approximately 3,600 lbs. Restomod: Varies by build",
        production: "Total 1951 F-Series: Approximately 254,000 (all models)"
      },
      popularOptions: [
        "V8 engine upgrade",
        "Deluxe cab (additional interior trim)",
        "Heater",
        "Oil filter",
        "Passenger-side windshield wiper and sun visor",
        "Chrome trim packages",
        "Dual horns",
        "Outside rearview mirror",
        "Two-tone paint",
        "Heavy-duty clutch"
      ],
      valueFactors: [
        "Body condition and rust-free status",
        "Originality of major components",
        "Completeness of trim and details",
        "V8 vs. six-cylinder configuration",
        "Documentation and history",
        "Quality of restoration or customization",
        "Rarity of factory options",
        "Mechanical condition"
      ]
    }
  };

  // Get current vehicle data
  const currentVehicle = vehicleData[selectedCar as keyof typeof vehicleData];
  const trendData = priceTrendData[selectedCar as keyof typeof priceTrendData];

  return (
    <div className="bg-offwhite min-h-screen">
      {/* Premium Video Header */}
      <VideoHeader
        title="Classic Vehicle Archive"
        subtitle="Explore the rich history, specifications, and market trends of iconic restomod vehicles"
        hashtag="Restomod"
        imageSrc="https://images.luxuryautodirect.com/19997/1967-ford-mustang-restomod-3.jpg"
        videoSrc="https://cdn.videvo.net/videvo_files/video/premium/video0229/large_watermarked/902-1_902-2040_preview.mp4"
      />

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Vehicle Selection Tabs */}
        <div className="mb-10">
          <Tabs defaultValue={selectedCar} onValueChange={(value) => setSelectedCar(value)}>
            <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-8">
              <TabsTrigger value="mustang1967">1967 Mustang</TabsTrigger>
              <TabsTrigger value="camaro1968">1968 Camaro</TabsTrigger>
              <TabsTrigger value="fordF1001953">1953 F-100</TabsTrigger>
              <TabsTrigger value="chevyII1966">1966 Chevy II</TabsTrigger>
              <TabsTrigger value="fordF11951">1951 F1</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Vehicle Display */}
        <div className="grid grid-cols-1 gap-10">
          {/* Left Column - Image and Basic Info */}
          <div className="w-full">
            <div className="rounded-sm overflow-hidden mb-6">
              <img 
                src={currentVehicle.mainImage} 
                alt={currentVehicle.name}
                className="w-full h-auto" 
              />
            </div>
            <h2 className="font-playfair text-3xl font-bold mb-2">{currentVehicle.name}</h2>
            <p className="text-xl text-charcoal/80 mb-6">{currentVehicle.tagline}</p>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Original Specifications</h3>
              <div className="space-y-2">
                {Object.entries(currentVehicle.specs).map(([key, value], index) => (
                  <div key={index} className="grid grid-cols-3 gap-4">
                    <span className="text-charcoal/70 font-medium col-span-1">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="col-span-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Popular Factory Options</h3>
              <ul className="list-disc list-inside space-y-1 text-charcoal/80">
                {currentVehicle.popularOptions.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Gallery</h3>
              <div className="grid grid-cols-2 gap-3">
                {currentVehicle.galleryImages.map((img, index) => (
                  <div key={index} className="rounded-sm overflow-hidden">
                    <img src={img} alt={`${currentVehicle.name} ${index + 1}`} className="w-full h-32 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Historical Information */}
          <div className="w-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-playfair text-2xl">Historical Information</CardTitle>
                <CardDescription>
                  Original production details, styling, and cultural significance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 overflow-y-auto max-h-[800px] pr-2">
                {Object.entries(currentVehicle.history).map(([key, value], index) => (
                  <div key={index}>
                    <h3 className="font-medium text-lg capitalize mb-2">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-charcoal/80 text-sm mb-4">{value}</p>
                    {index < Object.entries(currentVehicle.history).length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* Pricing Trends and Value Factors */}
          <div className="w-full">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-playfair text-2xl">Market Value Trends</CardTitle>
                <CardDescription>
                  10-year price trends for standard and show-quality examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value/1000}k`}
                      />
                      <Tooltip 
                        formatter={(value) => `$${value.toLocaleString()}`}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        name="Standard Example" 
                        dataKey="value" 
                        stroke="#5D7A94" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        name="Show Car Quality" 
                        dataKey="showCar" 
                        stroke="#7D2027" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 text-sm text-charcoal/80">
                  <p>This chart shows average market values for both standard restored examples and premium show-quality restomod builds. Values are approximate and based on auction results, private sales data, and expert appraisals.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-2xl">Value Factors</CardTitle>
                <CardDescription>
                  Key attributes that affect market value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-charcoal/80">
                  {currentVehicle.valueFactors.map((factor, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-burgundy mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-charcoal/5 rounded-sm">
                  <h4 className="font-medium mb-2">Value Range (2023)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-charcoal/70">Standard Example</p>
                      <p className="font-medium">{`$${trendData[trendData.length-1].value.toLocaleString()}`}</p>
                    </div>
                    <div>
                      <p className="text-xs text-charcoal/70">Show Car Quality</p>
                      <p className="font-medium">{`$${trendData[trendData.length-1].showCar.toLocaleString()}`}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="font-playfair text-3xl font-bold mb-4">Ready to Create Your Own Restomod?</h2>
          <p className="text-lg text-charcoal/80 max-w-2xl mx-auto mb-8">
            Our expert craftsmen can build a custom restomod based on any of these iconic vehicles, tailored to your specifications and vision.
          </p>
          <Link href="/#contact">
            <Button className="bg-burgundy hover:bg-burgundy/90 text-white px-8 py-6 text-lg">
              Request a Consultation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleArchive;

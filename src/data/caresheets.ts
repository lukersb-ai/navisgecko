export type CaresheetCard = {
  id: string;
  iconName: string;
  titlePl: string;
  titleEn: string;
  descPl: string;
  descEn: string;
  contentPl?: string;
  contentEn?: string;
};

export type SpeciesCaresheet = {
  id: string;
  namePl: string;
  nameEn: string;
  descriptionPl: string;
  descriptionEn: string;
  coverImage?: string;
  cards: CaresheetCard[];
};

export const speciesData: SpeciesCaresheet[] = [
  {
    id: "leopard-gecko",
    namePl: "Gekon Lamparci",
    nameEn: "Leopard Gecko",
    descriptionPl: "Kompleksowy poradnik dotyczący opieki, diety, oraz wymagań terrarystycznych Eublepharis macularius.",
    descriptionEn: "A comprehensive guide regarding care, diet, and terrarium requirements for Eublepharis macularius.",
    cards: [
      {
        id: "temp",
        iconName: "ThermometerSun",
        titlePl: "Temperatura i oświetlenie",
        titleEn: "Temperature and Lighting",
        descPl: "Wymagania cieplne, wyspa ciepła 32-35°C, oraz konieczny cykl dobowy.",
        descEn: "Heat requirements, basking spots of 32-35°C, and necessary day/night cycles."
      },
      {
        id: "diet",
        iconName: "Apple",
        titlePl: "Dieta i suplementacja",
        titleEn: "Diet and Supplementation",
        descPl: "Najlepsze owady karmowe, dobór witamin bez D3 oraz wapń z D3.",
        descEn: "Best feeder insects, choosing vitamins without D3 and calcium with D3."
      },
      {
        id: "terrarium",
        iconName: "Grid",
        titlePl: "Terrarium",
        titleEn: "Terrarium Setup",
        descPl: "Wymiary docelowe, odpowiednie bezstresowe podłoże i bezpieczne kryjówki.",
        descEn: "Optimal enclosure size, appropriate stress-free substrate, and secure hides."
      },
      {
        id: "handling",
        iconName: "HeartHandshake",
        titlePl: "Oswajanie",
        titleEn: "Handling",
        descPl: "Jak skutecznie i pomału budować relacje z gekonem, minimalizując stres.",
        descEn: "How to effectively and slowly build trust with your gecko, minimizing stress."
      }
    ]
  },
  {
    id: "crested-gecko",
    namePl: "Gekon Orzęsiony",
    nameEn: "Crested Gecko",
    descriptionPl: "Baza informacji o bezpiecznej hodowli nadrzewnego gekona Correlophus ciliatus z Nowej Kaledonii.",
    descriptionEn: "Information database on the safe breeding of the arboreal Correlophus ciliatus from New Caledonia.",
    cards: [
      {
        id: "temp",
        iconName: "ThermometerSun",
        titlePl: "Temperatura i wilgotność",
        titleEn: "Temperature and Humidity",
        descPl: "Wymagania pokojowe 22-26°C oraz częste zraszanie na poziomie 60-80%.",
        descEn: "Room requirements 22-26°C and frequent misting at 60-80% humidity."
      },
      {
        id: "diet",
        iconName: "Apple",
        titlePl: "Dieta w proszku i owady",
        titleEn: "Powdered Diet and Insects",
        descPl: "Gotowe karmy na bazie papki owocowej Pangea/Repashy i owady karmowe.",
        descEn: "Prepared fruit-based powder diets like Pangea/Repashy and feeder insects."
      },
      {
        id: "terrarium",
        iconName: "TreePine",
        titlePl: "Terrarium Wertykalne",
        titleEn: "Vertical Terrarium",
        descPl: "Terrarium ułożone pionowo z tubami dębu korkowego i roślinami.",
        descEn: "Vertically oriented terrarium with cork bark tubes and live plants."
      }
    ]
  }
];

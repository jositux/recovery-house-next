export interface StateData {
  name: string;
  cities: string[];
}

export interface CountryData {
  name: string;
  states: {
    [key: string]: StateData;
  };
}

export const countriesData: { [key: string]: CountryData } = {
  USA: {
    name: "United States",
    states: {
      CA: {
        name: "California",
        cities: [
          "Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", 
          "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim",
          "Santa Ana", "Riverside", "Stockton", "Irvine", "Chula Vista",
          "Fremont", "San Bernardino", "Modesto", "Fontana", "Oxnard",
          "Moreno Valley", "Huntington Beach", "Santa Clarita", "Glendale", "Santa Rosa"
        ]
      },
      NY: {
        name: "New York",
        cities: [
          "New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", 
          "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica",
          "White Plains", "Hempstead", "Troy", "Niagara Falls", "Binghamton",
          "Freeport", "Valley Stream", "Long Beach", "Rome", "North Tonawanda",
          "Ithaca", "Poughkeepsie", "Jamestown", "Elmira", "Saratoga Springs"
        ]
      },
      TX: {
        name: "Texas",
        cities: [
          "Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", 
          "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo",
          "Lubbock", "Garland", "Irving", "Amarillo", "Grand Prairie",
          "McKinney", "Frisco", "Brownsville", "Pasadena", "Killeen",
          "Mesquite", "McAllen", "Midland", "Waco", "Denton"
        ]
      },
      FL: {
        name: "Florida",
        cities: [
          "Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", 
          "Hialeah", "Port St. Lucie", "Tallahassee", "Cape Coral", "Fort Lauderdale",
          "Pembroke Pines", "Hollywood", "Miramar", "Gainesville", "Coral Springs",
          "Miami Gardens", "Clearwater", "Palm Bay", "Pompano Beach", "West Palm Beach",
          "Lakeland", "Davie", "Miami Beach", "Sunrise", "Boca Raton"
        ]
      },
      IL: {
        name: "Illinois",
        cities: [
          "Chicago", "Aurora", "Naperville", "Joliet", "Rockford", 
          "Springfield", "Elgin", "Peoria", "Champaign", "Waukegan",
          "Cicero", "Bloomington", "Arlington Heights", "Evanston", "Decatur",
          "Schaumburg", "Bolingbrook", "Palatine", "Skokie", "Des Plaines",
          "Orland Park", "Tinley Park", "Oak Lawn", "Berwyn", "Mount Prospect"
        ]
      }
    }
  },
  COL: {
    name: "Colombia",
    states: {
      ANT: {
        name: "Antioquia",
        cities: [
          "Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", 
          "Rionegro", "Turbo", "Caucasia", "Caldas", "La Estrella",
          "Sabaneta", "Copacabana", "Girardota", "Necoclí", "Barbosa",
          "Marinilla", "El Carmen de Viboral", "La Ceja", "Yarumal", "Santa Rosa de Osos",
          "Guarne", "Sonsón", "Chigorodó", "Carepa", "Andes"
        ]
      },
      BOG: {
        name: "Bogotá D.C.",
        cities: ["Bogotá"]
      },
      VAC: {
        name: "Valle del Cauca",
        cities: [
          "Cali", "Buenaventura", "Palmira", "Tuluá", "Cartago", 
          "Buga", "Jamundí", "Yumbo", "Candelaria", "Zarzal",
          "Sevilla", "Florida", "Pradera", "El Cerrito", "Caicedonia",
          "Roldanillo", "La Unión", "Dagua", "Guacarí", "Bugalagrande",
          "Andalucía", "Trujillo", "Vijes", "Restrepo", "Bolívar"
        ]
      },
      ATL: {
        name: "Atlántico",
        cities: [
          "Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Galapa", 
          "Baranoa", "Puerto Colombia", "Palmar de Varela", "Santo Tomás", "Sabanagrande",
          "Polonuevo", "Juan de Acosta", "Tubará", "Usiacurí", "Repelón",
          "Luruaco", "Ponedera", "Campo de la Cruz", "Candelaria", "Santa Lucía",
          "Manatí", "Suan", "Piojó", "Clemencia", "Molinero"
        ]
      },
      SAN: {
        name: "Santander",
        cities: [
          "Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", 
          "San Gil", "Socorro", "Barbosa", "Málaga", "Lebríja",
          "Cimitarra", "Sabana de Torres", "Puerto Wilches", "San Vicente de Chucurí", "Vélez",
          "Oiba", "Charalá", "Landázuri", "Zapatoca", "Rionegro",
          "El Playón", "Aratoca", "Puente Nacional", "Mogotes", "Suaita"
        ]
      }
    }
  }
}


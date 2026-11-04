export interface Planet {
  name: string;
  diameter: number; // km
  distanceFromSun: number; // million km
  orbitalPeriod: number; // Earth years
  color: string;
  orbitRadius: number; // px (scaled for display)
  size: number; // px (scaled for display)
  description: string;
  funFact: string;
}

export const planets: Planet[] = [
  {
    name: "Mercury",
    diameter: 4879,
    distanceFromSun: 57.9,
    orbitalPeriod: 0.24,
    color: "#b5b5b5",
    orbitRadius: 70,
    size: 8,
    description: "The smallest planet and closest to the Sun. Mercury has no atmosphere to retain heat, so temperatures swing dramatically between day and night.",
    funFact: "A day on Mercury (sunrise to sunrise) lasts 176 Earth days!"
  },
  {
    name: "Venus",
    diameter: 12104,
    distanceFromSun: 108.2,
    orbitalPeriod: 0.62,
    color: "#e8cda0",
    orbitRadius: 100,
    size: 12,
    description: "Often called Earth's twin due to similar size. Venus has a thick toxic atmosphere that traps heat, making it the hottest planet in our solar system.",
    funFact: "Venus rotates backwards compared to most planets — the Sun rises in the west!"
  },
  {
    name: "Earth",
    diameter: 12756,
    distanceFromSun: 149.6,
    orbitalPeriod: 1.0,
    color: "#4da6ff",
    orbitRadius: 140,
    size: 13,
    description: "Our home planet — the only known world with liquid water on its surface and the only planet known to support life.",
    funFact: "Earth is the densest planet in the solar system!"
  },
  {
    name: "Mars",
    diameter: 6792,
    distanceFromSun: 227.9,
    orbitalPeriod: 1.88,
    color: "#e07050",
    orbitRadius: 185,
    size: 10,
    description: "The Red Planet, named for its rusty iron-oxide surface. Mars has the largest volcano (Olympus Mons) and the deepest canyon (Valles Marineris) in the solar system.",
    funFact: "Mars has two tiny moons: Phobos and Deimos, likely captured asteroids!"
  },
  {
    name: "Jupiter",
    diameter: 142984,
    distanceFromSun: 778.6,
    orbitalPeriod: 11.86,
    color: "#d4a574",
    orbitRadius: 250,
    size: 28,
    description: "The largest planet — a gas giant with no solid surface. Jupiter's Great Red Spot is a storm larger than Earth that has raged for hundreds of years.",
    funFact: "Jupiter has at least 95 known moons, including the four large Galilean moons!"
  },
  {
    name: "Saturn",
    diameter: 120536,
    distanceFromSun: 1433.5,
    orbitalPeriod: 29.46,
    color: "#f0d890",
    orbitRadius: 320,
    size: 24,
    description: "Famous for its stunning ring system made of ice and rock particles. Saturn is a gas giant so light it could float in water (if you had a big enough bathtub).",
    funFact: "Saturn's rings are only about 10 meters thick but span 282,000 km!"
  },
  {
    name: "Uranus",
    diameter: 51118,
    distanceFromSun: 2872.5,
    orbitalPeriod: 84.01,
    color: "#7de8e8",
    orbitRadius: 385,
    size: 18,
    description: "An ice giant that rotates on its side, likely due to a massive ancient collision. Its blue-green color comes from methane in its atmosphere.",
    funFact: "Uranus rotates almost completely on its side at a 98° tilt!"
  },
  {
    name: "Neptune",
    diameter: 49528,
    distanceFromSun: 4495.1,
    orbitalPeriod: 164.8,
    color: "#4466ff",
    orbitRadius: 440,
    size: 17,
    description: "The windiest planet, with speeds reaching 2,100 km/h. Neptune is the farthest planet from the Sun and takes nearly 165 years to complete one orbit.",
    funFact: "Neptune was the first planet found by mathematical prediction rather than observation!"
  }
];

export const sunData = {
  name: "The Sun",
  diameter: 1392700,
  description: "Our star — a nearly perfect sphere of hot plasma. The Sun contains 99.86% of all mass in the solar system and provides the energy that sustains life on Earth.",
  funFact: "Light from the Sun takes about 8 minutes to reach Earth!",
  color: "#ffdd00",
  size: 50
};

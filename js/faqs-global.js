const GLOBAL_FAQS = [
  {
    "q": "What is the Periodic Table?",
    "a": "The periodic table is a tabular arrangement of the chemical elements, organized by their atomic number, electron configuration, and recurring chemical properties."
  },
  {
    "q": "How many elements are in the periodic table?",
    "a": "There are currently 118 recognized elements in the periodic table, ranging from Hydrogen (1) to Oganesson (118)."
  },
  {
    "q": "What is an atomic number?",
    "a": "The atomic number is the number of protons found in the nucleus of an atom. It uniquely identifies a chemical element."
  },
  {
    "q": "What is atomic mass?",
    "a": "Atomic mass is the total mass of protons and neutrons in an individual atom or isotope."
  },
  {
    "q": "What are Groups in the periodic table?",
    "a": "Groups are the vertical columns in the periodic table. Elements in the same group typically have similar chemical properties and the same number of valence electrons."
  },
  {
    "q": "What are Periods in the periodic table?",
    "a": "Periods are the horizontal rows in the periodic table. As you move from left to right across a period, the atomic number increases, and elements become less metallic."
  },
  {
    "q": "What is Electron Configuration?",
    "a": "Electron configuration describes how electrons are distributed in the atomic orbitals of an atom."
  },
  {
    "q": "What is Valency?",
    "a": "Valency is the combining capacity of an element, typically determined by the number of electrons in its outermost shell."
  },
  {
    "q": "What are Metals?",
    "a": "Metals are elements that are typically solid, shiny, malleable, and good conductors of heat and electricity. They make up most of the periodic table."
  },
  {
    "q": "What are Non-metals?",
    "a": "Non-metals are elements that generally lack metallic properties. They are mostly gases or brittle solids and are poor conductors of heat and electricity."
  },
  {
    "q": "What are Metalloids?",
    "a": "Metalloids have properties intermediate between metals and non-metals. Examples include silicon and boron."
  },
  {
    "q": "What are Noble Gases?",
    "a": "Noble gases are the elements in Group 18. They are odorless, colorless, monatomic gases with very low chemical reactivity due to their full valence electron shells."
  },
  {
    "q": "What are Isotopes?",
    "a": "Isotopes are variants of a particular chemical element which differ in neutron number, and consequently in nucleon number."
  },
  {
    "q": "What is Chemical Bonding?",
    "a": "Chemical bonding refers to the formation of a chemical bond between two or more atoms, molecules, or ions to give rise to a chemical compound."
  },
  {
    "q": "What are Alkali Metals?",
    "a": "Alkali metals (Group 1, excluding Hydrogen) are highly reactive metals that must be stored in oil to prevent reaction with moisture in the air."
  },
  {
    "q": "What are Alkaline Earth Metals?",
    "a": "Alkaline earth metals are Group 2 elements, somewhat less reactive than alkali metals but still highly reactive and commonly found in compounds."
  },
  {
    "q": "What are Transition Metals?",
    "a": "Transition metals are the d-block elements known for their hardness, high density, and ability to form various colorful compounds and oxidation states."
  },
  {
    "q": "What are Halogens?",
    "a": "Halogens (Group 17) are highly reactive non-metals that form salts when combined with metals."
  },
  {
    "q": "What is a chemical symbol?",
    "a": "A chemical symbol is a one- or two-letter abbreviation for a chemical element name, like 'O' for Oxygen or 'Au' for Gold."
  },
  {
    "q": "Why is the table called 'periodic'?",
    "a": "It's called 'periodic' because elements with similar properties appear at regular intervals or 'periods' when arranged by atomic number."
  },
  {
    "q": "What is an atom?",
    "a": "An atom is the smallest unit of ordinary matter that forms a chemical element. Every solid, liquid, gas, and plasma is composed of neutral or ionized atoms."
  },
  {
    "q": "What is a proton?",
    "a": "A proton is a subatomic particle with a positive electric charge, found in the nucleus of every atom."
  },
  {
    "q": "What is a neutron?",
    "a": "A neutron is a subatomic particle with no net electric charge, present in all atomic nuclei except for ordinary hydrogen."
  },
  {
    "q": "What is an electron?",
    "a": "An electron is a subatomic particle with a negative elementary electric charge, orbiting the nucleus in electron shells."
  },
  {
    "q": "What is electronegativity?",
    "a": "Electronegativity is a measure of the tendency of an atom to attract a bonding pair of electrons."
  },
  {
    "q": "What is ionization energy?",
    "a": "Ionization energy is the minimum amount of energy required to remove the most loosely bound electron of an isolated neutral gaseous atom or molecule."
  },
  {
    "q": "What is atomic radius?",
    "a": "Atomic radius is a measure of the size of its atom, usually the mean or typical distance from the center of the nucleus to the boundary of the surrounding shells of electrons."
  },
  {
    "q": "What are Lanthanides?",
    "a": "Lanthanides are a series of 15 metallic elements from lanthanum to lutetium (atomic numbers 57–71). They are often known as rare earth elements."
  },
  {
    "q": "What are Actinides?",
    "a": "Actinides are a series of 15 metallic elements from actinium to lawrencium (atomic numbers 89–103). They are all radioactive."
  },
  {
    "q": "What is a compound?",
    "a": "A chemical compound is a chemical substance composed of many identical molecules composed of atoms from more than one element held together by chemical bonds."
  },
  {
    "q": "Which element is most abundant in the universe?",
    "a": "Hydrogen is the most abundant element in the universe, accounting for about 75% of its baryonic mass."
  },
  {
    "q": "Which element is most abundant in the Earth's crust?",
    "a": "Oxygen is the most abundant element in the Earth's crust, making up almost half of its mass."
  },
  {
    "q": "What element is essential for organic life?",
    "a": "Carbon is the primary component of all known life on Earth, forming complex molecules like DNA and proteins."
  },
  {
    "q": "Which element is used in computer chips?",
    "a": "Silicon is a semiconductor widely used in electronics and computer microchips."
  },
  {
    "q": "What is the lightest element?",
    "a": "Hydrogen is the lightest element, with an atomic number of 1."
  },
  {
    "q": "What is the heaviest naturally occurring element?",
    "a": "Uranium (atomic number 92) is the heaviest element that occurs in significant quantities in nature."
  },
  {
    "q": "What element is used in lightbulbs?",
    "a": "Argon is commonly used in incandescent light bulbs to prevent the tungsten filament from oxidizing. Tungsten itself is used as the filament."
  },
  {
    "q": "Which metal is liquid at room temperature?",
    "a": "Mercury is the only metal that is liquid at standard conditions for temperature and pressure."
  },
  {
    "q": "Which non-metal is liquid at room temperature?",
    "a": "Bromine is the only non-metal that is liquid at room temperature."
  },
  {
    "q": "What element makes bones strong?",
    "a": "Calcium is an essential mineral for building and maintaining strong bones and teeth."
  },
  {
    "q": "Which element is used to disinfect swimming pools?",
    "a": "Chlorine is commonly used in swimming pools to kill bacteria and prevent algae growth."
  },
  {
    "q": "What gas makes balloons float?",
    "a": "Helium is lighter than air, which is why helium-filled balloons float."
  },
  {
    "q": "What metal rusts?",
    "a": "Iron is the primary metal that rusts when exposed to oxygen and moisture, forming iron oxide."
  },
  {
    "q": "Which element is used in pencils?",
    "a": "Carbon, in the form of graphite, is used as the 'lead' in pencils."
  },
  {
    "q": "What element is used in batteries?",
    "a": "Lithium is widely used in rechargeable batteries for electronics and electric vehicles."
  },
  {
    "q": "What is a half-life?",
    "a": "Half-life is the time required for a quantity of a radioactive isotope to reduce to half of its initial value."
  },
  {
    "q": "What are synthetic elements?",
    "a": "Synthetic elements are chemical elements that do not occur naturally on Earth and can only be created artificially in a lab or nuclear reactor."
  },
  {
    "q": "How are new elements discovered?",
    "a": "New, superheavy elements are typically discovered by smashing lighter atoms together in particle accelerators and observing the decay of the resulting heavier atoms."
  },
  {
    "q": "What is the octet rule?",
    "a": "The octet rule is a chemical rule of thumb that reflects the observation that atoms of main-group elements tend to combine in such a way that each atom has eight electrons in its valence shell."
  },
  {
    "q": "Why do elements in the same group react similarly?",
    "a": "Elements in the same group have the same number of valence electrons, which dictates their chemical behavior and reactivity."
  },
  {
    "q": "What happens when an alkali metal is put in water?",
    "a": "Alkali metals react violently with water, producing hydrogen gas, which can ignite, and an alkaline solution."
  },
  {
    "q": "What is a diatomic molecule?",
    "a": "Diatomic molecules are molecules composed of only two atoms, of the same or different chemical elements. Examples include O2 and N2."
  },
  {
    "q": "Why is the periodic table shaped the way it is?",
    "a": "The shape reflects the structure of the electron shells. Blocks (s, p, d, f) correspond to the subshell being filled with electrons."
  },
  {
    "q": "What is an oxidation state?",
    "a": "The oxidation state is a number assigned to an element in chemical combination that represents the number of electrons lost (or gained, if the number is negative) by an atom of that element in the compound."
  },
  {
    "q": "What does IUPAC do?",
    "a": "The International Union of Pure and Applied Chemistry (IUPAC) is the recognized authority on chemical nomenclature, terminology, standardized methods for measurement, atomic weights, and the naming of new elements."
  },
  {
    "q": "Are there undiscovered elements?",
    "a": "Yes, scientists predict that more superheavy elements beyond Oganesson (118) can be synthesized in the future, which would start a new row (period 8) on the periodic table."
  },
  {
    "q": "Why is water H2O?",
    "a": "Water is H2O because one oxygen atom forms covalent bonds with two hydrogen atoms to complete its outer electron shell."
  },
  {
    "q": "What is ozone?",
    "a": "Ozone (O3) is a triatomic molecule consisting of three oxygen atoms. It is much less stable than the diatomic allotrope O2."
  },
  {
    "q": "Why does copper turn green?",
    "a": "Copper turns green due to a slow chemical reaction with oxygen, water, and carbon dioxide, forming a protective layer called patina."
  },
  {
    "q": "What is a noble metal?",
    "a": "Noble metals (like gold, platinum, and silver) are metals that are resistant to corrosion and oxidation in moist air."
  },
  {
    "q": "What element is used in thermometers?",
    "a": "Historically, mercury was used in thermometers because it expands predictably with temperature. Today, alcohol or digital sensors are more common for safety."
  },
  {
    "q": "What gives fireworks their color?",
    "a": "Different metal salts are burned to create colors in fireworks. For example, strontium produces red, copper produces blue, and barium produces green."
  },
  {
    "q": "What element is diamond made of?",
    "a": "Diamonds are composed entirely of carbon atoms arranged in a rigid, tetrahedral crystal structure."
  },
  {
    "q": "What makes neon signs glow?",
    "a": "Neon signs glow when an electric current is passed through a tube filled with neon gas, exciting the electrons and emitting a characteristic reddish-orange light. Other gases produce different colors."
  },
  {
    "q": "What is the most toxic element?",
    "a": "Toxicity depends on dose and form, but elements like Plutonium, Polonium, and heavy metals like Lead, Mercury, and Thallium are extremely toxic."
  },
  {
    "q": "What is the rarest naturally occurring element on Earth?",
    "a": "Astatine is considered the rarest naturally occurring element in the Earth's crust, with only about 25 grams existing at any given time due to its rapid radioactive decay."
  },
  {
    "q": "What is the trend for atomic radius?",
    "a": "Atomic radius generally decreases across a period (left to right) and increases down a group (top to bottom)."
  },
  {
    "q": "What is the trend for electronegativity?",
    "a": "Electronegativity generally increases across a period (left to right) and decreases down a group (top to bottom)."
  },
  {
    "q": "What is the trend for ionization energy?",
    "a": "Ionization energy generally increases across a period (left to right) and decreases down a group (top to bottom)."
  },
  {
    "q": "Why are noble gases unreactive?",
    "a": "They have a full outer shell of valence electrons (an octet), making them energetically stable and unlikely to gain, lose, or share electrons."
  },
  {
    "q": "Why is Fluorine so reactive?",
    "a": "Fluorine is highly reactive because it is the most electronegative element, meaning it strongly attracts electrons to complete its valence shell."
  },
  {
    "q": "What is metallic character?",
    "a": "Metallic character refers to the level of reactivity of a metal. It increases down a group and decreases from left to right across a period."
  },
  {
    "q": "How is atomic mass calculated?",
    "a": "The atomic mass shown on the periodic table is a weighted average of the masses of all naturally occurring isotopes of that element."
  },
  {
    "q": "What is the difference between an element and a compound?",
    "a": "An element is a pure substance consisting of only one type of atom, while a compound consists of two or more different elements chemically bonded together."
  },
  {
    "q": "How do you read the periodic table?",
    "a": "Read the periodic table left to right, top to bottom. The elements are ordered by increasing atomic number. Use groups (columns) to find elements with similar properties."
  },
  {
    "q": "What are the transuranium elements?",
    "a": "Transuranium elements are the chemical elements with atomic numbers greater than 92 (which is the atomic number of uranium). All of these elements are unstable and decay radioactively into other elements."
  },
  {
    "q": "What is a cation?",
    "a": "A cation is a positively charged ion formed when an atom loses one or more electrons. Metals typically form cations."
  },
  {
    "q": "What is an anion?",
    "a": "An anion is a negatively charged ion formed when an atom gains one or more electrons. Nonmetals typically form anions."
  },
  {
    "q": "What is a covalent bond?",
    "a": "A covalent bond is a chemical bond that involves the sharing of electron pairs between atoms, usually nonmetals."
  },
  {
    "q": "What is an ionic bond?",
    "a": "An ionic bond is formed through the electrostatic attraction between oppositely charged ions, typically between a metal and a nonmetal."
  },
  {
    "q": "What is a metallic bond?",
    "a": "A metallic bond is the sharing of many detached electrons between many positive ions, where the electrons act as a 'glue' giving the substance a definite structure."
  },
  {
    "q": "What is Avogadro's number?",
    "a": "Avogadro's number (6.022 x 10^23) is the number of constituent particles (usually atoms or molecules) that are contained in one mole of a given substance."
  },
  {
    "q": "What is the s-block?",
    "a": "The s-block includes the first two groups (alkali and alkaline earth metals) plus hydrogen and helium. Their outermost electrons are in an s-orbital."
  },
  {
    "q": "What is the p-block?",
    "a": "The p-block contains groups 13 to 18. This block contains all the metalloids and nonmetals (except hydrogen and helium), plus some metals."
  },
  {
    "q": "What is the d-block?",
    "a": "The d-block comprises groups 3 through 12, known as the transition metals."
  },
  {
    "q": "What is the f-block?",
    "a": "The f-block appears as two footnotes below the main body of the periodic table, containing the lanthanides and actinides."
  }
];
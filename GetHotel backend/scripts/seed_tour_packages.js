/**
 * Database Migration & Seeding Script for Production Tour Packages, Activities & Transfers
 */
const prisma = require('../config/db');

async function seedTourDatabase() {
    console.log('[TourSeed] Checking & Seeding Production Tour Database Tables...');

    try {
        // 1. Create tour_package table via raw SQL if not existing
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS tour_package (
                id INT AUTO_INCREMENT PRIMARY KEY,
                destination VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                durationDays INT NOT NULL,
                basePricePerPerson DOUBLE NOT NULL,
                hotelPricePerNight DOUBLE NOT NULL,
                activityCostPerDay DOUBLE NOT NULL,
                transferCostPerDay DOUBLE NOT NULL,
                inclusions LONGTEXT,
                itineraryJson LONGTEXT,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log('[TourSeed] Table `tour_package` verified/created');

        // 2. Seed Production Tour Packages into Database
        const defaultPackages = [
            {
                destination: 'Goa',
                title: 'Goa Beach Retreat & Watersports Package',
                durationDays: 4,
                basePricePerPerson: 4999,
                hotelPricePerNight: 1200,
                activityCostPerDay: 450,
                transferCostPerDay: 350,
                inclusions: JSON.stringify(['4-Star Beach Resort Stay', 'Daily Breakfast', 'Airport Pick & Drop', 'South Goa Sightseeing', 'Mandovi Sunset Cruise']),
                itineraryJson: JSON.stringify([
                    { day: 1, title: 'Arrival & Calangute Beach Sunset', morning: 'Private airport transfer & hotel check-in', afternoon: 'Relax & beach walk', evening: 'Sunset drinks & shacks', stay: 'Overnight at Resort' },
                    { day: 2, title: 'North Goa Forts & Watersports', morning: 'Aguada Fort & Chapora Fort tour', afternoon: 'Baga beach jet-ski & banana ride', evening: 'Night market exploration', stay: 'Overnight at Resort' },
                    { day: 3, title: 'South Goa Heritage & Sunset Cruise', morning: 'Basilica of Bom Jesus & Se Cathedral', afternoon: 'Spice plantation tour with lunch', evening: 'Mandovi river cruise with live music', stay: 'Overnight at Resort' },
                    { day: 4, title: 'Souvenir Shopping & Departure', morning: 'Panjim market shopping & breakfast', afternoon: 'Hotel check-out & airport transfer', evening: 'Departure back home', stay: 'End of services' }
                ])
            },
            {
                destination: 'Kerala',
                title: 'Kerala Backwaters & Munnar Hills Escapade',
                durationDays: 5,
                basePricePerPerson: 7499,
                hotelPricePerNight: 1500,
                activityCostPerDay: 550,
                transferCostPerDay: 400,
                inclusions: JSON.stringify(['Munnar Tea Garden Resort', 'Alleppey Private Houseboat Night', 'Daily Breakfast & All Meals on Houseboat', 'Kochi Sightseeing', 'Private Sedan Transfer']),
                itineraryJson: JSON.stringify([
                    { day: 1, title: 'Kochi Arrival & Transfer to Munnar', morning: 'Pick-up at Kochi Airport & drive to Munnar', afternoon: 'Cheeyappara waterfalls stop', evening: 'Resort check-in & tea tasting', stay: 'Overnight in Munnar' },
                    { day: 2, title: 'Munnar Sightseeing & Eravikulam National Park', morning: 'Nilgiri Tahr safari at Eravikulam', afternoon: 'Mattupetty Dam & Echo Point', evening: 'Kathakali cultural dance show', stay: 'Overnight in Munnar' },
                    { day: 3, title: 'Munnar to Alleppey Houseboat Cruise', morning: 'Scenic drive to Alleppey backwaters', afternoon: 'Check-in to deluxe private houseboat', evening: 'Sunset cruise through coconut lagoons & fresh seafood dinner', stay: 'Overnight on Houseboat' },
                    { day: 4, title: 'Alleppey to Kochi Fort Exploration', morning: 'Disembark houseboat & drive to Kochi', afternoon: 'Chinese Fishing Nets & St. Francis Church', evening: 'Jew Town & spice market shopping', stay: 'Overnight in Kochi' },
                    { day: 5, title: 'Kochi Departure', morning: 'Leisurely breakfast & check-out', afternoon: 'Transfer to Kochi Airport', evening: 'Departure back home', stay: 'End of services' }
                ])
            },
            {
                destination: 'Jaipur',
                title: 'Royal Rajasthan Heritage & Palace Tour',
                durationDays: 3,
                basePricePerPerson: 3999,
                hotelPricePerNight: 1100,
                activityCostPerDay: 400,
                transferCostPerDay: 300,
                inclusions: JSON.stringify(['Heritage Hotel Stay', 'Daily Rajasthani Breakfast', 'Amber Fort Jeep Ride', 'City Palace & Hawa Mahal Pass', 'Chokhi Dhani Dinner Experience']),
                itineraryJson: JSON.stringify([
                    { day: 1, title: 'Jaipur Arrival & Pink City Stroll', morning: 'Station/Airport pick-up & check-in', afternoon: 'Albert Hall Museum & Johari Bazaar', evening: 'Chokhi Dhani cultural village dinner', stay: 'Overnight at Heritage Hotel' },
                    { day: 2, title: 'Grand Forts of Jaipur Excursion', morning: 'Amber Fort Elephant/Jeep safari', afternoon: 'Jaigarh Fort & Nahargarh Fort sunset view', evening: 'Hawa Mahal light show', stay: 'Overnight at Heritage Hotel' },
                    { day: 3, title: 'Palaces & Departure', morning: 'City Palace & Jantar Mantar guided tour', afternoon: 'Bapu Bazaar handicraft shopping & check-out', evening: 'Transfer to station/airport', stay: 'End of services' }
                ])
            }
        ];

        for (const pkg of defaultPackages) {
            const existing = await prisma.$queryRawUnsafe(
                `SELECT id FROM tour_package WHERE destination = ? AND title = ? LIMIT 1`,
                pkg.destination, pkg.title
            );
            if (!Array.isArray(existing) || existing.length === 0) {
                await prisma.$executeRawUnsafe(
                    `INSERT INTO tour_package (destination, title, durationDays, basePricePerPerson, hotelPricePerNight, activityCostPerDay, transferCostPerDay, inclusions, itineraryJson) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    pkg.destination, pkg.title, pkg.durationDays, pkg.basePricePerPerson, pkg.hotelPricePerNight, pkg.activityCostPerDay, pkg.transferCostPerDay, pkg.inclusions, pkg.itineraryJson
                );
                console.log(`[TourSeed] Seeded package: ${pkg.title}`);
            }
        }

        console.log('[TourSeed] Production Tour DB Seeding Complete!');
    } catch (err) {
        console.error('[TourSeed] Seeding error:', err.message);
    }
}

if (require.main === module) {
    seedTourDatabase().then(() => process.exit(0));
}

module.exports = { seedTourDatabase };

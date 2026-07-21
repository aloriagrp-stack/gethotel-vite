const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: node import_hotel.js <path_to_json_file> <hotel_id>');
        process.exit(1);
    }

    const jsonPath = path.resolve(args[0]);
    const hotelId = parseInt(args[1]);

    if (isNaN(hotelId)) {
        console.error('Error: Hotel ID must be a valid number.');
        process.exit(1);
    }

    if (!fs.existsSync(jsonPath)) {
        console.error(`Error: JSON file not found at ${jsonPath}`);
        process.exit(1);
    }

    console.log(`Reading hotel data from ${jsonPath}...`);
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    let hotelData;
    try {
        hotelData = JSON.parse(fileContent);
    } catch (e) {
        console.error('Error: Failed to parse JSON file:', e.message);
        process.exit(1);
    }

    // Validate structure
    if (!hotelData.name || !hotelData.address) {
        console.error('Error: Invalid JSON format. "name" and "address" are required.');
        process.exit(1);
    }

    console.log(`Connecting to database to update Hotel ID ${hotelId}...`);
    const existingHotel = await prisma.hotel.findUnique({
        where: { id: hotelId }
    });

    if (!existingHotel) {
        console.error(`Error: Hotel with ID ${hotelId} does not exist in the database.`);
        process.exit(1);
    }

    console.log(`Found existing hotel: "${existingHotel.name}"`);

    // Determine city
    const city = hotelData.city || existingHotel.city || "New Delhi";

    // Prepare update data for Hotel
    const updateData = {
        name: hotelData.name,
        description: hotelData.description || existingHotel.description,
        address: hotelData.address,
        city: city,
        guestRating: hotelData.rating ? parseFloat(hotelData.rating) : existingHotel.guestRating,
        reviewCount: hotelData.reviewCount ? parseInt(hotelData.reviewCount) : existingHotel.reviewCount,
    };

    // If images are provided, update images and thumbnail
    if (hotelData.images && Array.isArray(hotelData.images) && hotelData.images.length > 0) {
        updateData.thumbnail = hotelData.images[0];
        updateData.images = JSON.stringify(hotelData.images);
    }

    // Determine min price from rooms if rooms are provided
    if (hotelData.rooms && Array.isArray(hotelData.rooms) && hotelData.rooms.length > 0) {
        let minPrice = Infinity;
        hotelData.rooms.forEach(r => {
            const priceVal = typeof r.price === 'string' ? parseFloat(r.price.replace(/[^\d.]/g, '')) : parseFloat(r.price);
            if (!isNaN(priceVal) && priceVal < minPrice) {
                minPrice = priceVal;
            }
        });
        if (minPrice !== Infinity) {
            updateData.pricePerNight = minPrice;
        }
    }

    console.log('Updating hotel details...');
    const updatedHotel = await prisma.hotel.update({
        where: { id: hotelId },
        data: updateData
    });
    console.log('Hotel updated successfully!');

    // Update rooms if provided
    if (hotelData.rooms && Array.isArray(hotelData.rooms) && hotelData.rooms.length > 0) {
        console.log('Updating room prices...');
        const existingRooms = await prisma.room.findMany({
            where: { hotelId: hotelId }
        });

        console.log(`Found ${existingRooms.length} existing rooms in DB.`);

        for (const roomData of hotelData.rooms) {
            const priceVal = typeof roomData.price === 'string' ? parseFloat(roomData.price.replace(/[^\d.]/g, '')) : parseFloat(roomData.price);
            if (isNaN(priceVal)) {
                console.log(`Skipping room "${roomData.name || roomData.room_type}" due to invalid price.`);
                continue;
            }

            const roomName = roomData.name || roomData.room_type;
            const matchedRoom = existingRooms.find(r => r.name.toLowerCase() === roomName.toLowerCase());

            if (matchedRoom) {
                await prisma.room.update({
                    where: { id: matchedRoom.id },
                    data: { pricePerNight: priceVal }
                });
                console.log(`Updated room "${matchedRoom.name}" (ID: ${matchedRoom.id}) price to ₹${priceVal}`);
            } else {
                console.log(`Warning: Room named "${roomName}" not found for this hotel in DB. Skipping price update.`);
            }
        }
    }

    console.log('Import operation completed!');
}

main()
    .catch(e => {
        console.error('Fatal database error during import:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

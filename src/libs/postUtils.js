async function geoCodeAddress(addressObject) {
    try {
        const addressParts = [
            addressObject.flatnumber,
            addressObject.street,
            addressObject.landmark,
            addressObject.city,
            addressObject.district,
            addressObject.state,
            addressObject.pincode,
            addressObject.country,
        ].filter((elem) => elem && elem.trim() !== "");

        const address = addressParts.join(", ");

        if (!address) {
            throw new Error("Address is empty");
        }

        const encodedAddress = encodeURIComponent(address);

        const MAPBOX_URI = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${process.env.MAPBOX_TOKEN}&limit=1`;

        const response = await fetch(MAPBOX_URI);

        if (!response.ok) {
            throw new Error(
                `Mapbox API error: ${response.status} ${response.statusText}`,
            );
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            throw new Error("No result for provided address");
        }

        const firstResult = data.features[0];

        const result = firstResult.center;

        return {
            result,
            placeName: firstResult.place_name,
            fullResponse: data,
        };
    } catch (error) {
        console.log("error", error);
    }
}

export { geoCodeAddress };

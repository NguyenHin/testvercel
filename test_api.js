async function testAPI() {
    try {
        const response = await fetch('http://localhost:3003/api/location/provinces');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data length:', data.length);
        if (data.length > 0) {
            console.log('First province:', data[0]);
        } else {
            console.log('Data is empty!');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPI();
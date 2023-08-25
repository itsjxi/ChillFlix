export async function fetchDataFromUrl(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Data fetched successfully:");
      let finalData = data.ratings;
      return finalData;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
    
  }
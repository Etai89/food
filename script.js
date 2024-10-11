$(document).ready(() => {

    const TOKEN = 'AIzaSyB4Hka0BMKYNd5tiMCJo5G3qB13oDO40d8';

    $('#btn').click(() => {
        let ingredients = $('#ingredients').val();  // Move inside click event

        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${TOKEN}`;

        const requestData = {
            contents: [
                {
                    parts: [
                        {
                            text: `Find a recipe that includes some of the ingredients from the list ${ingredients}.
                                The recipe should be in Hebrew, and it's okay if not all ingredients are used.
                                Return the response as HTML, but omit the <html>, <body>, and other similar tags
                                beside <ul> and <li> for the ingredients and the orders. Add an attribute lng to the <h2> title tag 
                                with the title of the recipe in English while keeping the content of the tag in Hebrew,
                                make sure there is ONLY ONE <h2> title in hebrew but the attribute in english, dont use span or a tags or more than 1 <h2>.
                                `
                        }
                    ]
                }
            ]
        };

        $.ajax({
            url: apiEndpoint,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(requestData),
            success: function (response) {
                const generatedContent = response.candidates[0].content.parts[0].text.replaceAll(`*`, '');
                $('#pop').html(generatedContent);

                const keywords = getRecipeName(); // Store the result from getRecipeName
                getImage(keywords); // Pass keywords to getImage
            },
            error: function (error) {
                console.error("Error communicating with Gemini AI Studio:", error);
                $('#pop').text("An error occurred. Please try again.");
            }
        });
    });

    const getRecipeName = () => {
        const keywordElement = $('h2[lng]');
        const lngValue = keywordElement.attr('lng');  // Assume there's only one h2 with lng
        console.log(lngValue);
        return lngValue;  // Return the lng value
    }

    const getImage = (keywords) => {
        const PEXELS_TOKEN = 'wB0Z7SEwhT7JqHGjiMRH7YXtRzLjLH3oGZK7XxKdHoddPPa3F7Z6O7y9';
        let page = 1;
    
        console.log("Keywords for Pexels search:", keywords); // Log the keywords
    
        $.ajax({
            url: 'https://api.pexels.com/v1/search',
            type: 'GET',
            headers: {
                Authorization: PEXELS_TOKEN
            },
            data: {
                query: keywords,
                per_page: 1,
                page: page
            },
            success: function (response) {
                if (response.photos && response.photos.length > 0) {
                    const photoUrl = response.photos[0].src.small;
                    $('#myImage').append(`<img src="${photoUrl}" alt="Recipe Image"/>`);
                } else {
                    console.log("No images found for the given keywords.");
                }
            },
            error: function (error) {
                console.error("Error fetching image:", error);
            }
        });
    }
    

});

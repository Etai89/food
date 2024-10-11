$(document).ready(() => {
    const TOKEN = 'AIzaSyB4Hka0BMKYNd5tiMCJo5G3qB13oDO40d8';
    let deferredPrompt; // Declare deferredPrompt here

    checkForAppInstall();

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-info bar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
    });

    function isMobileDevice() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    function checkForAppInstall() {
        if (isMobileDevice()) {
            if (deferredPrompt) {
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        alert('Thanks for installing the app!');
                    } else {
                        alert('App installation declined.');
                    }
                    // Clear the deferredPrompt variable, since it can only be used once
                    deferredPrompt = null;
                });
            } else {
                // Alert only if the app is not already installed
                alert('To add this page to your home screen, tap the share icon and select "Add to Home Screen".');
            }
        }
    }

    $('#btn').click(() => {
        $('#pop').html('');
        let ingredients = $('#ingredients').val();  // Get the ingredients
        let language = $('#language').val();
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${TOKEN}`;

        const requestData = {
            contents: [
                {
                    parts: [
                        {
                            text: `Find a recipe that includes some of the ingredients from the list ${ingredients}.
                                The recipe should be in ${language}, and it's okay if not all ingredients are used.
                                Return the response as HTML, but omit the <html>, <body>, and other similar tags.
                                for the ingredients and the orders. Add an attribute lng to the <h2> title tag 
                                with the title of the recipe in English while keeping the content of the tag in ${language},
                                make sure there is ONLY ONE <h2> title in ${language} but the attribute in English, don't use span or a tags or more than 1 <h2>.
                                after each process add <br>`
                        }
                    ]
                }
            ]
        };

        const languages = ['English', 'Espaniol', 'French'];
        if (languages.includes(language)) {
            $('html').attr('dir', 'ltr');
        } else {
            $('html').attr('dir', 'rtl');
        }

        $.ajax({
            url: apiEndpoint,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(requestData),

            success: function (response) {
                const generatedContent = response.candidates[0].content.parts[0].text.replaceAll(`*`, '');
                $('#pop').html(generatedContent);

                const keywords = getRecipeName(); // Store the result from getRecipeName
                $('#ingredients').val(''); // Clear the ingredients text area
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
        $('#myImage').html('');
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
                    const photoUrl = response.photos[0].src.landscape;
                    console.log({ response });
                    $('#myImage').append(`<img id="imgFood" src="${photoUrl}" alt="Recipe Image"/>`);
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

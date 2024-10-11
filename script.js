$(document).ready(() => {
    const TOKEN = 'AIzaSyB4Hka0BMKYNd5tiMCJo5G3qB13oDO40d8';
    let deferredPrompt;
    const installKey = 'appInstalled'; // Key to track app install state

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            }).catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-info bar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;

        // Only show the prompt if the app hasn't been installed
        if (!localStorage.getItem(installKey)) {
            showInstallPrompt();
        }
    });

    // Listen for the appinstalled event to track successful installations
    window.addEventListener('appinstalled', () => {
        console.log('App has been installed.');
        localStorage.setItem(installKey, 'true'); // Store installation state
    });

    function showInstallPrompt() {
        $('#btn').show(); // Show button or prompt UI
    }

    $('#btn').click(() => {
        // Ensure the app install prompt is shown after the button is clicked
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    alert('Thanks for installing the app!');
                    localStorage.setItem(installKey, 'true');
                } else {
                    alert('App installation declined.');
                }
                deferredPrompt = null;
            });
        }
    });

    // Existing click handler functionality for generating content
    $('#pop').html('');
    let ingredients = $('#ingredients').val();
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

    const getRecipeName = () => {
        const keywordElement = $('h2[lng]');
        const lngValue = keywordElement.attr('lng');
        console.log(lngValue);
        return lngValue;
    }

    const getImage = (keywords) => {
        $('#myImage').html('');
        const PEXELS_TOKEN = 'wB0Z7SEwhT7JqHGjiMRH7YXtRzLjLH3oGZK7XxKdHoddPPa3F7Z6O7y9';
        let page = 1;

        console.log("Keywords for Pexels search:", keywords);

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

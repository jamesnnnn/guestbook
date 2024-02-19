$(document).ready(function () {

    colourText();
    colourDivs();

	$(document).on("mouseenter mouseleave", ".textColour", function() {	$( this ).css("color", getRandomColour()); });
	$(document).on("mouseover click", ".divColour", function() { colourDiv(this); });
	
})

function colourText() {

	//for each jsColour class set a new colour
	$('.textColour').each(function( index ) {
	  $(this).css("color", getRandomColour());
	});

}

function colourDivs() {

	//for each jsColour class set a new colour
	$('.divColour').each(function( index ) {
		$(this).css("background-color", getRandomColour('light'));
	});

}

function colourDiv(div) {
	$(div).css("background-color", getRandomColour('light'));
}


function getRandomColour(theme) {

    var letters = '0123456789ABCDEF'.split('');
	//get a random colour 
	//not even
	if(theme == 'light') {
		letters = 'CDEF'.split('');
	} else if (theme == 'dark') {
		letters = '0123'.split('');
	}
	
    var colour = '#';
    for (var i = 0; i < 6; i++ ) {
        colour += letters[Math.round(Math.random() * (letters.length - 1))];
    }
    return colour;
	
}



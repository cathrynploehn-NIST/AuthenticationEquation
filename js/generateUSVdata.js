var generateUSVData = function ( input ) {
	// Read each password
	for ( var i = 0; i < input.length; i++ ) {
		var currentPassword = input[i];
		var currentMetricList = {};

		currentMetricList['originalPassword'] = currentPassword;

		// Calculate lpd score
		calculateLPDList(currentMetricList, currentPassword, null);

		// Permute password

		// Calculate entropy

		// Calculate keystrokes

		// Calculate length, number of letters, number of numerics and number of symbols in each password

		// Store current LPD score list in USG_list

	}
	var permutePass = function ( password ) {
		// Create arrays to hold characters
		var lowerArray = [];
		var upperArray = [];
		var digitArray = [];
		var symbolArray = [];

		var upper = lower = digit = space = 0;

		for(var i = 0; i < password.length; i++){
			var c = password[i];

		}

	};
	var calculateLPDList = function ( currentMetricList, currentPassword, label ) {
		
		// running total for current password's LPD
		var currentLPD = 0;

		// Stores phrases into which passwords are broken into
		var phrases = [];

		// Holds current phrase (subsection of the password)
		var currentPhrase = null;

		currentPassword = currentPassword.strip()

		if(label = null){
			label = '';
		}

// Step 1 - Parse by symbol
	// Check the character at index 0 of current_password
	// If the character is a symbol,
	// 	Add 1 point to the LPD
		
		var symbolStartFlag = isSymbol(password.charAt(0));

		// Parse into phrases
		if(symbolStartFlag) {
			currentLPD += 1;
			currentMetricList[label + 'symbolStart'] = 1;
			// For each character in current_password
			for (var i = 0; i < currentPassword.length; i++) {

				if (isSymbol(currentPassword[i])){
					
					// Add current phrase to phrase list if not empty
					if (currentPhrase) {
						phrases.push(currentPhrase);
					}				
					
					// Increment currentPhrase
					currentPhrase = null;

					// Add symbol to the start of the current phrase
					if (!currentPhrase){
						currentPhrase = '';
					}
						
					currentPhrase += c;

				} else {
					// Concatenate the character at the end of current phrase
					if (!currentPhrase){
						currentPhrase = '';
					}
						 
					currentPhrase += c;
				}
			}

		} else {
			currentMetricList[label + 'symbolStart'] = 0;

			// For each character in current_password
			for (var i = 0; i < currentPassword.length; i++) {
				if (isSymbol(currentPassword[i])){
					// Add symbol to the end of the current phrase
					if(!currentPhrase){
						currentPhrase = '';
					}
					currentPhrase += c;

					// Add current phrase to phrase list if not empty
					phrases.push(currentPhrase);

					// Increment current_phrase
					currentPhrase = null;

				} else {
					// Concatenate the character at the end of current phrase
					if(!currentPhrase){
						currentPhrase = '';
					}
					currentPhrase += c;
				}
			}
		}

		if(currentPhrase){
			phrases.push(currentPhrase);
		}

		currentPhrase = null;
		
// Step 2 - Number of phrases
		var phraseSize = phrases.length;

		// If phrase size is neither 1 or 2
		if( phraseSize != 1 && phraseSize != 2 ){
			currentLPD += (((phraseLength - 3) * 2) + 1);
			currentMetricList[label + 'chunks'] = (((phraseLength - 3) * 2) + 1);
		} else {
			currentMetricList[label + 'chunks'] = 0;
		}

		// Create to keep track of running total for phrase size score, mixed character score, un-sentence like capital score, and pronounceability score
		lenScore = 0;
		mixScore = 0;
		capScore = 0;
		pronScore = 0;

		for(var i = 0; i < phrases.length; i++){

			currentPhrase = prases[i];
			phraseLength = currentPhrase.length;

// Step 3 - Phrase size
			
			// If 4 <= size <= 5:
			if (phraseLength == 4 || phraseLength == 5){
				lenScore += 1;
			}
				
			// If 6 <= size <= 7:
			else if (phraseLength == 6 || phraseLength == 7){
				lenScore += 2;
			}
				
			// If 8 <= size <= 9:
			else if (phraseLength == 8 || phraseLength == 9){
				lenScore += 3;
			}
				
			// If 10 <= size <= 11:
			else if (phraseLength == 10 || phraseLength == 11){
				lenScore += 4;
			}
				
			// If 12 <= size <= 13:
			else if (phraseLength == 12 || phraseLength >= 13){
				lenScore += 5;
			}

// Step 4 - Un-sentence like capitalization
			var re = /([a-zA-Z]+)[A-Z]([a-zA-Z]*)/;

			var found = currentPhrase.match(re);
			if(found){
				capScore++;
			}

// Step 5 - mixed character strings
			if(phraseLength >= 3){
				var re = /([0-9]+[a-zA-Z]+[0-9]+)|([a-zA-Z]+[0-9]+[a-zA-Z]+)/;
				var found = currentPhrase.match(re);
				if(found){
					mixScore++;
				}
	
			}

// Step 6 - pronounceable character sequence
			onset = "(P|B|T|D|K|G|W|F|Ph|V|Th|S|Z|M|N|L|R|W|H|Y|Sh|Ch|J|Pl|Bl|Kl|Gl|Pr|Br|Tr|Dr|Kr|Gr|Tw|Dw|Gw|Kw|Pw|Sp|Sk|St|Sm|Sn|Sph|Sth|Spl|Scl|Spr|Str|Scr|Squ|Sm|Sphr|Wr|Gn|Xy|ps)";
			nucleus = "(I|E|A|O|U|Oo|Ea|Ir|Y|Oy|ee|ea|ou|o|ow)";
			coda = "(P|B|T|D|K|G|H|J|W|F|Ph|V|Th|S|Z|M|N|L|R|Q|Y|Sh|C|Lp|Lb|Lt|Lch|Lge|Lk|Rp|Rb|Rt|Rd|Rch|Rge|Rk|Rgue|Lf|Lve|Lth|Lse|Lsh|Rf|Rve|Rth|Rce|Rs|Rsh|Lm|Ln|Rm|Rn|Rl|Mp|Nt|Nd|Ch|Nge|Nk|Mph|Mth|Nth|Nce|Nze|Gth|Ft|Sp|St|Sk|Fth|Pt|Ct|Pth|Pse|Ghth|Tz|Dth|X|Lpt|Lfth|Ltz|Lst|Lct|Lx|Mth|Rpt|Rpse|Rtz|Rst|Rct|Mpt|Mpse|Ndth|Nct|Nx|Gth|Xth|xt|ng)";
			
			specials = "(hm|(" + onset + "*8(T|Th|S)))"; // 1337 and other pneumonics can be added here

			re = ".*((" + onset + "*" + nucleus + "{1}" + coda + "{1})|" + "(" + onset + "{1}" + nucleus + "{1}" + coda + "*)|" + specials + ").*";

			re = re.toLowerCase();
			re = new RegExp(re, i);
			
			var found = currentPhrase.match(re);
			if(found){
				for(var i = 0; i < found.length; i++){
					pronScore--;
				}
			}
		}

		// Add LPD scores to totall running LPD for steps 3, 4, 5, 6
		currentLPD += mixScore;
		currentLPD += capScore;
		currentLPD += lenScore;
		currentLPD += pronScore;

		// Add LPD scores  to the list for steps 3, 4, 5, 6
		currentMetricList[label+'characters'] = lenScore;
		currentMetricList[label+'unsentenceLikeCaps'] = capScore;
		currentMetricList[label+'mixedCharacterString'] = mixScore;
		currentMetricList[label+'pronounceable'] = pronScore;
		currentMetricList[label+'lpd'] = currentLPD;

		lenScore = 0;
		mixScore = 0;
		capScore = 0;
		pronScore = 0;

		return currentMetricList;

		var isSymbol = function ( c ) {
			if  (c == '!' || c == '@' || c == '#' || c == '$' || c == '%' || c == '^' || c == '&' || c == '*' || c == '(' || c == ')' || c == '-' || c == '_' || c == '+' || c == '=' || c == '{' || c == '}' || c == '[' || c == ']' || c == '|' || c == '\\' || c == ':' || c == ';' || c == '\'' || c == '"' || c == '<' || c == '>' || c == ',' || c == '.' || c == '/' || c == '?' || c == '`' || c == '~'){
				return true;
			} else {
				return false;
			}
};
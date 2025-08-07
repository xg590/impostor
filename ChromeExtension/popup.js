document.addEventListener("DOMContentLoaded", async function () { 
    // https://developer.chrome.com/docs/extensions/reference/tabs/#method-query
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (tab?.url) { // Optional chaining (?.)
		try {
			let url = new URL(tab.url);
			document.getElementById('InputDomain').value = url.hostname;
		} catch { ; }
	}

	// 2. Add event listener for textarea changes (paste cookies)
	document.getElementById('TextareaCookies').addEventListener('input', function() {
		document.getElementById('BtnLoadCookies').innerHTML = 'Apply<br/>Cookies';
		document.getElementById('BtnLoadCookies').value     = 'apply';
	});

	// 3. Get cookies and save them
	document.getElementById('BtnGetCookies').onclick = async function () {
		var domain = document.getElementById('InputDomain').value; 
		// https://developer.chrome.com/docs/extensions/reference/cookies/
		// https://github.com/GoogleChrome/chrome-extensions-samples
		const _arrCookies = await chrome.cookies.getAll({domain: domain});  
		var arrCookies = [];
		_arrCookies.forEach(_cookie => { 
			var cookie = {}; // nine items in cookie
			cookie['url'           ] = (_cookie.secure ? 'https://' : 'http://') + (_cookie.domain.charAt(0)=='.' ? _cookie.domain.slice(1) : _cookie.domain) + _cookie.path;
			cookie['domain'        ] = _cookie.domain;
			cookie['expirationDate'] = _cookie.expirationDate;
			cookie['httpOnly'      ] = _cookie.httpOnly;
			cookie['name'          ] = _cookie.name;
			cookie['path'          ] = _cookie.path;
			cookie['secure'        ] = _cookie.secure;
			cookie['storeId'       ] = _cookie.storeId;
			cookie['value'         ] = _cookie.value;
			arrCookies.push(cookie);
		});
		document.getElementById('TextareaCookies').innerHTML = JSON.stringify(arrCookies).replaceAll("},", "},\n");
		document.getElementById('BtnLoadCookies' ).innerHTML = 'Save<br/>Cookies';
		document.getElementById('BtnLoadCookies' ).value     = 'save';
		console.log('Cookies Got');
	};

	function applyCookies(strCookies) {
		try {
			const arrCookies = JSON.parse(strCookies); 
			console.log('Cookies parsed');
			// url and path must match with each other, or cookies is invalid. 
			arrCookies.forEach(cookie => {
				chrome.cookies.set(cookie, function (cookie){console.log(JSON.stringify(cookie))});
			});
			console.log('Cookies applied');
		} catch (error) {
			console.log('Cookies parsing error: ', error);
			return;
		}
	}; 

	// 1. Load cookies from a file and apply them
	async function loadCookies() {
		return new Promise((resolve, reject) => {
			const input = document.createElement('input');
			input.type = 'file';

			input.onchange = function (e) {
				const reader = new FileReader();
				const [file] = e.target.files;
				
				reader.onload = function(e) {
					const strCookies = e.target.result;
					resolve(strCookies);
				};
				
				reader.onerror = reject;
				reader.readAsText(file);
			};
			
			document.body.appendChild(input);
			input.click();
			document.body.removeChild(input);
		});
	}

	function saveCookies(strCookies) { // save cookies text in the textarea to a file
		if (!strCookies) return; // Don't download if empty 
		const domain = document.getElementById('InputDomain').value;

		// Create blob and download link
		const blob = new Blob([strCookies], { type: 'application/json' });
		const url  = URL.createObjectURL(blob); 
		const a    = document.createElement('a');
		a.href     = url;
		a.download = domain + '.json';
		document.body.appendChild(a);
		
		// Trigger download
		a.click();
		
		// Cleanup
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	document.getElementById('BtnLoadCookies').onclick = async function applyLoadSaveCookies() {  
		const value = document.getElementById('BtnLoadCookies').value;
		if (value == 'load') { // default: load cookies from a file to textarea
			const strCookies = await loadCookies(); // load 
			applyCookies(strCookies);
			window.close();
		} else if (value == 'apply') { // textarea is pasted with cookies so we apply them
			const strCookies = document.getElementById('TextareaCookies').value;
			applyCookies(strCookies);
			window.close();
		} else if (value == 'save') { // textarea is filled with cookies so we save them
			const strCookies = document.getElementById('TextareaCookies').value;
			saveCookies(strCookies);
			// 延迟关闭窗口，给下载足够时间完成
			setTimeout(() => window.close(), 1000);
		} else {
			console.log('Invalid button value: ', value);
			window.close();
		}
	};
});
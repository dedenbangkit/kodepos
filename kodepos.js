let LineUp = require('lineup');
let lineup = new LineUp()
let quest = require('inquirer');
let csvWriter = require('csv-write-stream')
let writer = csvWriter()
const fs = require('fs');
const http = require('http');
const color = require('colors');
const api = 'http://kalarau.net/api/v1/kodepos/search?q=';
const delay = 6000;

console.log('\n');
console.log(color.white('######################') + color.green('PENCARIAN KODE POS') + color.white('#####################'));
console.log(color.white('                                                               '));
console.log(color.white('    88  dP  dP"Yb  8888b.  888888     88""Yb  dP"Yb  .dP"Y8    '));
console.log(color.white('    88odP  dP   Yb  8I  Yb 88__       88__dP dP   Yb `Ybo."    '));
console.log(color.white('    88"Yb  Yb   dP  8I  dY 88""       88"""  Yb   dP o.`Y8b    '))
console.log(color.white('    88  Yb  YbodP  8888Y"  888888     88      YbodP  8bodP"    '));
console.log(color.white('                                                               '));
console.log(color.white('                                  Credit  : ') + color.green('Deden Bangkit'));
console.log(color.white('                                  API Data: ') + color.green('kalarau.net'));
console.log(color.white('#############################################################'));
console.log('\n');


let questions = [{
            type: 'input',
            name: 'keys',
            message: "Kata Kunci, apapun (e.g Mergangsan)",
            validate: function(text) {
                if (text.length < 4) {
                    return "minimal 4 karakter!"
                } else {
                    return true
                }
            }},
            {
                type: 'list',
                name: 'type',
                message: 'Pencarian spesifik berdasarkan:',
                choices: [{
                        name: 'Desa / Kelurahan',
                        value: 'kelurahan'
                    },
                    {
                        name: 'Kecamatan',
                        value: 'kecamatan'
                    },
                    {
                        name: 'Kota / Kabupaten',
                        value: 'kota'
                    },
                    {
                        name: 'Propinsi',
                        value: 'propinsi'
                    },
                    {
                        name: 'Cari semua',
                        value: 'all'
                    }
                ]
            },
            {
                type: 'list',
                name: 'format',
                message: 'Export ke format:',
                choices: [{
                    name: 'CSV (comma saperated files)',
                    value: '.csv'
                }, {
                    name: 'PDF',
                    value: '.pdf'
                }, {
                    name: 'Json',
                    value: '.json'
                }]
            },
            {
                type: 'input',
                name: 'filename',
                message: 'Nama file (tanpa .filetype)',
            },
        ]

function getData(generated_link, filters, filename, keyword) {
	lineup.progress.start('Mencari Data .....');
	http.get(generated_link, function(res) {
		let body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			lineup.progress.stop();
			let response = JSON.parse(body);
			let length = response.result.length;
			for (let i = 0; i < length; i++) {
				let provinsi = response.result[i]['provinsi'];
				let kabupaten = response.result[i]['kabupaten'];
				let kota = response.result[i]['kota'];
				let kecamatan = response.result[i]['kecamatan'];
				let kelurahan = response.result[i]['kelurahan'];
				let kodepos = response.result[i]['kodepos'];
				let dati;
				let dati_name;
				if (kabupaten == null) {
					dati = 'kotamadya';
					dati_name = kota;
				} else {
					dati = 'kabupaten';
					dati_name = kabupaten;
				}
				let results = {
					'provinsi': provinsi,
					'wilayah': dati,
					'administratif': dati_name,
					'kecamatan': kecamatan,
					'kelurahan': kelurahan,
					'kodepos': kodepos,
				};
				filterOut(results, keyword, filters);
			};
			let totalpage = parseInt(response.meta.pagination['total_pages']);
			let totalres = response.meta.pagination['total'];
			let next_link = response.meta.pagination.links.next;
			if (typeof next_link !== 'undefined') {
				getData(next_link, filters, filename, keyword);
			} else {
				console.log('\n');
				console.log('file ' + filename + ' sudah tersimpan');
				writer.end()
			}
		});
	});
}

function filterOut(data, keyword, filters) {
	let provinsi = consoleLog(data.provinsi, keyword);
	let administratif = consoleLog(data.administratif, keyword);
	let kecamatan = consoleLog(data.kecamatan, keyword);
	let kelurahan = consoleLog(data.kecamatan, keyword);
	let log = provinsi + ', ' + administratif + ', ' + kecamatan + ', ' + kelurahan  + ' - ' + color.cyan(data.kodepos);
	if (keyword === 'all') {
		console.log(log);
		writer.write(data);
		return;
	};
	let matching = data[filters];
	matching = matching.toLowerCase();
	keyword = keyword.toLowerCase();
	if (matching.match(keyword)) {
		console.log(log);
		writer.write(data);
	};
	return;
}

function consoleLog(d, k) {
	data = d.toLowerCase();
	keyword = k.toLowerCase();
	if (data.match(keyword)) {
		return color.yellow(data);
	}
	return color.white(data);
}

quest.prompt(questions).then(answers => {
	let filename = answers.filename + answers.format;
	writer.pipe(fs.createWriteStream(filename));
	let link = api + answers.keys;
	getData(link, answers.type, filename, answers.keys);
});

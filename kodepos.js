let LineUp = require('lineup');
let prompt = require('prompt');
let lineup = new LineUp()
const http = require('http');
const color = require('colors');
const api = 'http://kalarau.net/api/v1/kodepos/search?q=';
const delay = 6000;
// Get all cities

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

prompt.start();
prompt.get([{
    properties: {
        input: {
            description: color.cyan("Kata Kunci (") + color.white("contoh: Mergangsan " + color.cyan("):"))
        }
    }
}, ], function(err, result) {
    let location = result.input;
    lineup.progress.start('Mencari Data .....');
    http.get(api + location, function(res) {
        let body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            lineup.progress.stop();
            let response = JSON.parse(body);
            let length = response.result.length;
            console.log(length);
            for (let i = 0; i < length; i++) {
                let provinsi = response.result[i]['provinsi'];
                let kabupaten = response.result[i]['kabupaten'];
                let kota = response.result[i]['kota'];
                let kecamatan = response.result[i]['kecamatan'];
                let kelurahan = response.result[i]['kelurahan'];
                let kodepos = response.result[i]['kodepos'];
                if (kabupaten == null) {
                    console.log(color.white(provinsi + ', ' + kota + ', ' + kecamatan + ', ' + kelurahan) + ' - ' + color.cyan(kodepos));
                } else {
                    console.log(color.white(provinsi + ', ' + kabupaten + ', ' + kecamatan + ', ' + kelurahan) + ' - ' + color.cyan(kodepos));
                }
            };

            let totalpage = parseInt(response.meta.pagination['total_pages']);
            let totalres = response.meta.pagination['total'];

            let next_link = response.meta.pagination.links.next;
            next_page(next_link);

        });
    });

});

function next_page(link) {
    http.get(link, function(goes) {
        let body = '';
        goes.on('data', function(chunk) {
            body += chunk;
        });
        goes.on('end', function() {
            let response = JSON.parse(body);
            let length = response.result.length;
            for (let i = 0; i < length; i++) {
                let provinsi = response.result[i]['provinsi'];
                let kabupaten = response.result[i]['kabupaten'];
                let kota = response.result[i]['kota'];
                let kecamatan = response.result[i]['kecamatan'];
                let kelurahan = response.result[i]['kelurahan'];
                let kodepos = response.result[i]['kodepos'];

                if (kabupaten == null) {
                    console.log(color.white(provinsi + ', ' + kota + ', ' + kecamatan + ', ' + kelurahan) + ' - ' + color.cyan(kodepos));
                } else {
                    console.log(color.white(provinsi + ', ' + kabupaten + ', ' + kecamatan + ', ' + kelurahan) + ' - ' + color.cyan(kodepos));
                };
            }
            let next_link = response.meta.pagination.links.next;
            if (typeof next_link !== 'undefined'){
                next_page(next_link);
            }
        });

    });
}

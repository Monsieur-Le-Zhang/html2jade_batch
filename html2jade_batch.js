/**
 * Created by Le on 3/10/2015.
 */

var config = require('./lib/settings');
var fs = require('fs');
var html2jade = require('html2jade');

function checkInputDir() {
    fs.exists(config.input_dir, function (exists) {
        if (!exists) {
            console.error('The input directory dont exist');
        } else {
            next (null);
        }
    });
}

function checkOutputDir() {
    fs.exists(config.output_dir, function (exists) {
        if (!exists) {
            console.error('The output directory dont exist');
        } else {
            deleteFolderRecursive(config.output_dir)
            next (null, config);
        }
    });
}

function deleteFolderRecursive(path) {
    if(fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (item, index) {
            var newPath = path + '/' + item;
            var stat = fs.statSync(newPath);
            if (stat.isDirectory()) {
                deleteFolderRecursive(newPath);
                fs.rmdirSync(newPath);
            } else {
                fs.unlinkSync(newPath);
            }
        });
    }
}

function html2jade_batch(config) {
    var dirList = fs.readdirSync(config.input_dir);
    dirList.forEach(function (item, index) {
        var newPath = {
            input_dir: config.input_dir + '/' + item,
            output_dir: config.output_dir + '/' + item
        }

        var stat = fs.statSync(newPath.input_dir);
        if (stat.isDirectory()) {
            fs.mkdirSync(newPath.output_dir);
            html2jade_batch(newPath);
        } else if (stat.isFile()) {
            if (/html$/g.test(newPath.output_dir)) {
                var html = fs.readFileSync(newPath.input_dir, 'utf8');
                html2jade.convertHtml(html, {double: true, tabs: true}, function (err, jade) {
                    fs.writeFile(newPath.output_dir.replace(/[.]\S*html$/g, '.jade'), jade);
                })
            }
        }
    });
}

var tasks = [
    checkInputDir,
    checkOutputDir,
    html2jade_batch
]

function next (err, result) {
    if (err) {
        throw err;
    } else {
        var currentTask = tasks.shift();
        if (currentTask) {
            currentTask(result);
        }
    }
}

next();
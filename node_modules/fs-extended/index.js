'use strict';

var fs = require('fs');
var path = require('path');

module.exports = fs;

/**
 * Dummy function.
 *
 * @return {Void}
 */
function dummy() {}

/**
 * Normalizes mode argument into a decimal integer.
 *
 * Examples:
 *   0666  = 438
 *   '777' = 511
 *
 * @param  {Mixed} mode
 *
 * @return {Int}
 */
function modenum(mode, def) {
	switch (typeof mode) {
		case 'number': return mode;
		case 'string': return parseInt(mode, 8);
		default: return def ? modenum(def) : undefined;
	}
}

/**
 * Converts fs.Stats.mode format to a decimal notation to match modenum().
 *
 * Examples:
 *   16895 => 511
 *
 * @param  {Mixed} mode
 *
 * @return {Int}
 */
function statmode(mode) {
	return mode & 511;
}

/**
 * Normalize optional callback function.
 *
 * @param  {Function} callback
 *
 * @return {Function}
 */
function norback(callback) {
	return typeof callback === 'function' ? callback : function (err) {
		if (err && err instanceof Error) {
			throw err;
		}
	};
}

/**
 * Shallow object extend.
 *
 * Doesn't copy arrays or objects.
 *
 * Example:
 *   extend({}, defaults, options);
 *
 * @return {Void}
 */
function extend() {
	var args = arguments;

	Object.keys(args[1]).forEach(walk);

	function walk(key) {
		args[0][key] = args[1][key];
	}

	return args.length > 2 ?
		extend.apply(null, [args[0]].concat(Array.prototype.slice.call(args, 2))) :
		args[0];
}

/**
 * Create a new file, or override an existing one.
 *
 * Creates destination directory if it doesn't exist yet.
 *
 * @param  {String}   file
 * @param  {String}   data
 * @param  {Mixed}    [options]
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.createFile = function (file, data, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = undefined;
	}
	file = path.resolve(file);
	callback = norback(callback);

	createFile(fileCreated);

	function createFile(callback) {
		fs.writeFile(file, data, options, callback);
	}

	function fileCreated(err) {
		if (!err) {
			return callback(null);
		}

		if (err.code !== 'ENOENT') {
			return callback(err);
		}

		fs.createDir(path.dirname(file), function (err) {
			if (err) {
				return callback(err);
			}
			createFile(function (err) {
				callback(err);
			});
		});
	}
};

/**
 * Synchronous fs.createFile().
 *
 * @param  {String} file
 * @param  {String} data
 * @param  {String} [options]
 *
 * @return {Void}
 */
fs.createFileSync = function (file, data, options) {
	file = path.resolve(file);

	try {
		createFile();
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
		fs.createDirSync(path.dirname(file));
		createFile();
	}

	function createFile() {
		fs.writeFileSync(file, data, options);
	}
};

/**
 * Ensure file exists, and has a specified mode.
 *
 * Creates destination directory if it doesn't exist yet.
 *
 * @param  {String}   file
 * @param  {String}   [mode]     Defaults to existing file mode, or 0666 when file doesn't exist.
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.ensureFile = function (file, mode, callback) {
	if (typeof mode === 'function') {
		callback = mode;
		mode = undefined;
	}
	file = path.resolve(file);
	callback = norback(callback);
	var newMode = modenum(mode, 438);
	var fileCreatedErr;

	create(fileCreated);

	function create(callback) {
		fs.writeFile(file, '', { flag: 'wx', mode: newMode }, callback);
	}

	function fileCreated(err) {
		if (!err) {
			return callback(null);
		}
		fileCreatedErr = err;
		switch (err.code) {
			case 'ENOENT':
				fs.createDir(path.dirname(file), dirCreated);
				break;

			case 'EEXIST':
				fs.stat(file, ensureMode);
				break;

			default:
				callback(err);
		}
	}

	function dirCreated(err) {
		if (err) {
			return callback(err);
		}
		create(callback);
	}

	function ensureMode(err, stat) {
		if (err) {
			return callback(err);
		}

		if (!stat.isFile()) {
			return callback(fileCreatedErr);
		}

		if (mode && statmode(stat.mode) + process.umask() !== newMode) {
			fs.chmod(file, newMode, callback);
		} else {
			callback(null);
		}
	}
};

/**
 * Synchronous fs.ensureFile().
 *
 * @param  {String} file
 * @param  {String} [mode] Defaults to existing file mode, or 0666 when file doesn't exist.
 *
 * @return {Void}
 */
fs.ensureFileSync = function (file, mode) {
	file = path.resolve(file);
	var newMode = modenum(mode);

	try {
		create();
	} catch (err) {
		switch (err.code) {
			case 'ENOENT':
				fs.createDirSync(path.dirname(file));
				create();
				break;

			case 'EEXIST':
				var stat = fs.statSync(file);

				if (!stat.isFile()) {
					throw err;
				}

				if (mode && statmode(stat.mode) + process.umask() !== newMode) {
					fs.chmodSync(file, newMode);
				}
				break;

			default:
				throw err;
		}
	}

	function create() {
		fs.writeFileSync(file, '', { flag: 'wx', mode: newMode });
	}
};

/**
 * Copy file.
 *
 * Creates destination directory if it doesn't exist yet.
 *
 * @param  {String}   src
 * @param  {String}   dst
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.copyFile = function (src, dst, callback) {
	callback = norback(callback);
	var mode, read, write;

	fs.stat(src, getMode);

	function getMode(err, stat) {
		if (err) {
			return callback(err);
		}
		mode = statmode(stat.mode);
		createRead();
		createWrite();
	}

	function createRead() {
		read = fs.createReadStream(src);
		read.pause();
		read.once('error', error);
	}

	function createWrite() {
		write = fs.createWriteStream(dst, { mode: mode });
		write.once('open', writeOpen);
		write.once('error', writeError);
		write.once('finish', callback);
	}

	function writeOpen() {
		read.pipe(write);
		read.resume();
	}

	function writeError(err) {
		if (err.code !== 'ENOENT') {
			return error(err);
		}
		fs.createDir(path.dirname(dst), createWrite);
	}

	function error(err) {
		// This is an embarrassing attempt to terminate streams in any state without them memory
		// leaking, or causing uncaught errors that might crash the process. I have no idea how
		// to do this properly, as this shit is just not fucking documented. Node docs suck.
		read.removeAllListeners('error');
		write.removeAllListeners('open');
		write.removeAllListeners('error');
		write.removeAllListeners('finish');
		read.on('error', dummy);
		write.on('error', dummy);
		read.pause();
		read.unpipe();
		read.destroy();
		write.destroy();
		// Attempt to clean up the destination file
		fs.deleteFile(dst, function () {
			callback(err);
		});
	}
};

/**
 * Synchronous fs.copyFile().
 *
 * @param  {String} src
 * @param  {String} dst
 *
 * @return {Void}
 */
fs.copyFileSync = function (src, dst) {
	dst = path.resolve(dst);
	var BUF_LENGTH = 64 * 1024;
	var buff = new Buffer(BUF_LENGTH);
	var mode = statmode(fs.statSync(src).mode);
	var fdr = fs.openSync(src, 'r');
	var fdw;
	var bytesRead = 1;
	var pos = 0;

	try {
		fdw = fs.openSync(dst, 'w', mode);
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
		fs.createDirSync(path.dirname(dst));
		fdw = fs.openSync(dst, 'w', mode);
	}

	while (bytesRead > 0) {
		bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
		fs.writeSync(fdw, buff, 0, bytesRead);
		pos += bytesRead;
	}

	fs.closeSync(fdr);
	fs.closeSync(fdw);
};

/**
 * Move file from one location to another.
 *
 * Creates destination directory if it doesn't exist yet, and works between partitions & filesystems.
 *
 * @param  {String}   src
 * @param  {String}   dst
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.moveFile = function (src, dst, callback) {
	dst = path.resolve(dst);
	callback = norback(callback);

	fs.rename(src, dst, function (err) {
		if (!err) {
			return callback(null);
		}
		switch (err.code) {
			case 'ENOENT':
				fs.createDir(path.dirname(dst), dirCreated);
				break;

			case 'EXDEV':
				fs.copy(src, dst, fileCopied);
				break;

			default:
				callback(err);
		}
	});

	function done(err) {
		if (err) {
			callback(err);
		} else {
			callback(null);
		}
	}

	function dirCreated(err) {
		if (err) {
			return callback(err);
		}
		fs.rename(src, dst, done);
	}

	function fileCopied(err) {
		if (err) {
			return callback(err);
		}
		fs.delete(src, done);
	}
};

/**
 * Synchronous fs.moveFile().
 *
 * @param  {String} src
 * @param  {String} dst
 *
 * @return {Void}
 */
fs.moveFileSync = function (src, dst) {
	dst = path.resolve(dst);

	try {
		fs.renameSync(src, dst);
	} catch (err) {
		switch (err.code) {
			case 'ENOENT':
				fs.createDirSync(path.dirname(dst));
				fs.renameSync(src, dst);
				break;

			case 'EXDEV':
				fs.copySync(src, dst);
				fs.deleteSync(src);
				break;

			default:
				throw err;
		}
	}
};

/**
 * Delete contents of a file.
 *
 * Creates a file when it doesn't already exist.
 *
 * @param  {String}   file
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.emptyFile = function (file, callback) {
	fs.truncate(file, 0, norback(callback));
};

/**
 * Synchronous fs.emptyFile().
 *
 * @param  {String} dir
 *
 * @return {Void}
 */
fs.emptyFileSync = function (file) {
	fs.truncateSync(file, 0);
};

/**
 * Delete a file.
 *
 * Doesn't throw an error when file doesn't exist.
 *
 * @param  {String}   file
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.deleteFile = function (file, callback) {
	callback = norback(callback);

	fs.unlink(file, deleted);

	function deleted(err) {
		if (err && err.code !== 'ENOENT') {
			return callback(err);
		}
		callback(null);
	}
};

/**
 * Synchronous fs.deleteFile().
 *
 * @param  {String} file
 *
 * @return {Void}
 */
fs.deleteFileSync = function (file) {
	try {
		fs.unlinkSync(file);
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}
};

/**
 * Create a directory.
 *
 * Also creates missing parent directories.
 *
 * @param  {String}   dir
 * @param  {String}   [mode]     Defaults to 0777.
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.createDir = function (dir, mode, callback) {
	if (typeof mode === 'function') {
		callback = mode;
		mode = undefined;
	}
	dir = path.resolve(dir);
	callback = norback(callback);
	var newMode = modenum(mode, 511);
	var dirCreatedErr;

	create(dirCreated);

	function create(callback) {
		fs.mkdir(dir, newMode, callback);
	}

	function dirCreated(err) {
		if (!err) {
			return callback(null);
		}
		dirCreatedErr = err;
		switch (err.code) {
			case 'ENOENT':
				fs.createDir(path.dirname(dir), parentsCreated);
				break;

			case 'EEXIST':
				fs.stat(dir, ensureMode);
				break;

			default:
				callback(err);
		}
	}

	function parentsCreated(err) {
		if (err) {
			return callback(err);
		}
		create(callback);
	}

	function ensureMode(err, stat) {
		if (err) {
			return callback(err);
		}

		if (stat.isFile()) {
			return callback(dirCreatedErr);
		}

		if (mode && statmode(stat.mode) + process.umask() !== newMode) {
			fs.chmod(dir, newMode, callback);
		} else {
			callback(null);
		}
	}
};

/**
 * Synchronous fs.createDir().
 *
 * @param  {String} dir
 * @param  {String} [mode] Defaults to 0777.
 *
 * @return {Void}
 */
fs.createDirSync = function (dir, mode) {
	dir = path.resolve(dir);
	var newMode = modenum(mode, 511);

	try {
		create();
	} catch (err) {
		switch (err.code) {
			case 'ENOENT':
				fs.createDirSync(path.dirname(dir));
				create();
				break;

			case 'EEXIST':
				var stat = fs.statSync(dir);

				if (stat.isFile()) {
					throw err;
				}

				if (mode && statmode(stat.mode) + process.umask() !== newMode) {
					fs.chmodSync(dir, newMode);
				}
				break;

			default:
				throw err;
		}
	}

	function create() {
		fs.mkdirSync(dir, newMode);
	}
};

/**
 * Copy directory.
 *
 * Creates destination directory if it doesn't exist yet.
 *
 * @param  {String}   src
 * @param  {String}   dst
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.copyDir = function (src, dst, callback) {
	dst = path.resolve(dst);
	callback = norback(callback);
	var files;

	fs.stat(src, createDir);

	function createDir(err, stat) {
		if (err) {
			return callback(err);
		}
		fs.createDir(dst, statmode(stat.mode), dirCreated);
	}

	function dirCreated(err) {
		if (err) {
			return callback(err);
		}
		fs.readdir(src, processFiles);
	}

	function processFiles(err, fls) {
		if (err) {
			return callback(err);
		}
		files = fls;
		next();
	}

	function next() {
		if (!files.length) {
			return callback(null);
		}
		var file = files.pop();
		var filePath = path.join(src, file);
		var destPath = path.join(dst, file);
		fs.stat(filePath, function (err, stat) {
			if (err) {
				return callback(err);
			}
			if (stat.isFile()) {
				fs.copyFile(filePath, destPath, copyDone);
			} else {
				fs.copyDir(filePath, destPath, copyDone);
			}
		});
	}

	function copyDone(err) {
		if (err) {
			callback(err);
		} else {
			next();
		}
	}
};

/**
 * Synchronous fs.copyDir().
 *
 * @param  {String} src
 * @param  {String} dst
 *
 * @return {Void}
 */
fs.copyDirSync = function (src, dst) {
	dst = path.resolve(dst);
	fs.createDirSync(dst);
	var files = fs.readdirSync(src);

	for (var i = 0, l = files.length; i < l; i++) {
		var file = files[i];
		var filePath = path.join(src, file);
		var destPath = path.join(dst, file);
		if (fs.statSync(filePath).isFile()) {
			fs.copyFileSync(filePath, destPath);
		} else {
			fs.copyDirSync(filePath, destPath);
		}
	}
};

/**
 * Move directory from one location to another.
 *
 * Creates destination directory if it doesn't exist yet, and works between partitions & filesystems.
 *
 * @param  {String}   src
 * @param  {String}   dst
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.moveDir = function (src, dst, callback) {
	dst = path.resolve(dst);
	callback = norback(callback);

	fs.rename(src, dst, renamed);

	function renamed(err) {
		if (!err) {
			return callback(null);
		}
		switch (err.code) {
			case 'EXDEV':
				fs.createDir(path.dirname(dst), parentCreated);
				break;

			case 'ENOENT':
				fs.copyDir(src, dst, dirCopied);
				break;

			default:
				callback(err);
		}
	}

	function parentCreated(err) {
		if (err) {
			return callback(err);
		}
		fs.rename(src, dst, done);
	}

	function dirCopied(err) {
		if (err) {
			return callback(err);
		}
		fs.delete(src, done);
	}

	function done(err) {
		if (err) {
			callback(err);
		} else {
			callback(null);
		}
	}
};

/**
 * Synchronous fs.moveDir().
 *
 * @param  {String} src
 * @param  {String} dst
 *
 * @return {Void}
 */
fs.moveDirSync = function (src, dst) {
	dst = path.resolve(dst);

	try {
		fs.renameSync(src, dst);
	} catch (err) {
		switch (err.code) {
			case 'ENOENT':
				fs.createDirSync(path.dirname(dst));
				fs.renameSync(src, dst);
				break;

			case 'EXDEV':
				fs.copyDirSync(src, dst);
				fs.deleteSync(src);
				break;

			default:
				throw err;
		}
	}
};

/**
 * Delete everything inside a directory, but keep the directory.
 *
 * Creates a directory when it doesn't already exist.
 *
 * @param  {String}   target
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.emptyDir = function (dir, callback) {
	callback = norback(callback);
	var files, file, filePath;

	fs.readdir(dir, startWalking);

	function startWalking(err, fls) {
		if (err) {
			return err.code === 'ENOENT' ? fs.createDir(dir, callback) : callback(err);
		}
		files = fls;
		next();
	}

	function next() {
		if (!files.length) {
			return callback(null);
		}
		file = files.pop();
		filePath = path.join(dir, file);
		fs.stat(filePath, processFile);
	}

	function processFile(err, stat) {
		if (err) {
			return callback(err);
		}
		if (stat.isFile()) {
			fs.unlink(filePath, itemDeleted);
		} else {
			fs.deleteDir(filePath, itemDeleted);
		}
	}

	function itemDeleted(err) {
		if (err) {
			return callback(err);
		}
		next();
	}
};

/**
 * Synchronous fs.emtyDir().
 *
 * @param  {String} dir
 *
 * @return {Void}
 */
fs.emptyDirSync = function (dir) {
	var files, file, filePath;

	try {
		files = fs.readdirSync(dir);
	} catch (err) {
		if (err.code === 'ENOENT') {
			return fs.createDirSync(dir);
		} else {
			throw err;
		}
	}

	for (var i = 0, l = files.length; i < l; i++) {
		file = files[i];
		filePath = path.join(dir, file);
		if (fs.statSync(filePath).isFile()) {
			fs.unlinkSync(filePath);
		} else {
			fs.deleteDirSync(filePath);
		}
	}
};

/**
 * Delete directory and everything in it.
 *
 * @param  {String} dir
 *
 * @return {Void}
 */
fs.deleteDir = function (dir, callback) {
	dir = path.resolve(dir);
	callback = norback(callback);

	fs.rmdir(dir, dirDeleted);

	function dirDeleted(err) {
		if (!err) {
			return callback(null);
		}
		switch (err.code) {
			case 'ENOENT':
				callback(null);
				break;
			case 'ENOTEMPTY':
				fs.emptyDir(dir, dirEmptied);
				break;
			default:
				callback(err);
		}
	}

	function dirEmptied(err) {
		if (err) {
			return callback(err);
		}
		fs.rmdir(dir, callback);
	}
};

/**
 * Synchronous fs.deleteDir().
 *
 * @param  {String} dir
 *
 * @return {Void}
 */
fs.deleteDirSync = function (dir) {
	dir = path.resolve(dir);

	try {
		fs.rmdirSync(dir);
	} catch (err) {
		switch (err.code) {
			case 'ENOENT':
				break;
			case 'ENOTEMPTY':
				fs.emptyDirSync(dir);
				fs.rmdirSync(dir);
				break;
			default:
				throw err;
		}
	}
};

/**
 * Copy file or directory from one location to another.
 *
 * Creates destination directory if it doesn't exist yet.
 *
 * @param  {String}   src
 * @param  {String}   dst
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.copy = function (src, dst, callback) {
	callback = norback(callback);
	fs.stat(src, function (err, stat) {
		if (err) {
			return callback(err);
		}
		fs[stat.isFile() ? 'copyFile' : 'copyDir'](src, dst, callback);
	});
};

/**
 * Synchronous fs.copy().
 *
 * @param  {String} src
 * @param  {String} dst
 *
 * @return {Void}
 */
fs.copySync = function (src, dst) {
	return fs[fs.statSync(src).isFile() ? 'copyFileSync' : 'copyDirSync'](src, dst);
};

/**
 * Move file or directory from one location to another.
 *
 * Creates destination directory if it doesn't exist yet, and works between partitions & filesystems.
 *
 * @param  {String}   src
 * @param  {String}   dst
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.move = function (src, dst, callback) {
	callback = norback(callback);
	fs.stat(src, function (err, stat) {
		if (err) {
			return callback(err);
		}
		fs[stat.isFile() ? 'moveFile' : 'moveDir'](src, dst, callback);
	});
};

/**
 * Synchronous fs.move().
 *
 * @param  {String} src
 * @param  {String} dst
 *
 * @return {Void}
 */
fs.moveSync = function (src, dst) {
	return fs[fs.statSync(src).isFile() ? 'moveFileSync' : 'moveDirSync'](src, dst);
};

/**
 * Empty file or directory.
 *
 * @param  {String}   target
 * @param  {Function} [callback]
 *
 * @return {Void}
 */
fs.empty = function (target, callback) {
	callback = norback(callback);

	fs.stat(target, empty);

	function empty(err, stat) {
		if (err) {
			return callback(err);
		}
		if (stat.isFile()) {
			fs.emptyFile(target, callback);
		} else {
			fs.emptyDir(target, callback);
		}
	}
};

/**
 * Synchronous fs.empty().
 *
 * @param  {String} target
 *
 * @return {Void}
 */
fs.emptySync = function (target) {
	if (fs.statSync(target).isFile()) {
		fs.emptyFileSync(target);
	} else {
		fs.emptyDirSync(target);
	}
};

/**
 * Delete file, or directory and everything in it.
 *
 * @param  {String} target
 *
 * @return {Void}
 */
fs.delete = function (target, callback) {
	callback = norback(callback);

	fs.stat(target, deleteTarget);

	function deleteTarget(err, stat) {
		if (err) {
			return callback(err.code === 'ENOENT' ? null : err);
		}
		if (stat.isFile()) {
			fs.deleteFile(target, callback);
		} else {
			fs.deleteDir(target, callback);
		}
	}
};

/**
 * Synchronous fs.delete().
 *
 * @param  {String} target
 *
 * @return {Void}
 */
fs.deleteSync = function (target) {
	var stat;
	try {
		stat = fs.statSync(target);
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
		return;
	}

	if (stat.isFile()) {
		fs.deleteFileSync(target);
	} else {
		fs.deleteDirSync(target);
	}
};

/**
 * List all files in directory.
 *
 * @param  {String}   dir
 * @param  {Object}   [options]
 * @param  {Function} callback
 * @param  {Boolean}  [baseDir]
 *
 * @return {Void}
 */
function listAll(dir, options, callback, baseDir) {
	if (typeof options === 'function') {
		baseDir = callback;
		callback = options;
		options = false;
	}
	var loadStats = options.recursive ||
		options.filter && options.filter.length > 1 ||
		options.map && options.map.length > 1;
	var list = [];
	var i = 0;
	var files, file, filePath;

	fs.readdir(dir, startWalking);

	function startWalking(err, fls) {
		if (err) {
			return callback(err);
		}
		files = fls;
		next();
	}

	function next() {
		if (i >= files.length) {
			return callback(null, options.sort ?
				list.sort(typeof options.sort === 'function' ? options.sort : undefined) :
				list);
		}
		file = files[i++];
		filePath = path.join(dir, file);
		if (loadStats) {
			fs.stat(filePath, processFile);
		} else {
			processFile();
		}
	}

	function processFile(err, stat) {
		if (err) {
			return callback(err);
		}
		if (!options.filter || options.filter(filePath, stat)) {
			list.push(options.map ?
				options.map(filePath, stat) :
				options.prependDir ? filePath : path.relative(String(baseDir || dir), String(filePath)));
		}
		if (options.recursive && !stat.isFile()) {
			listAll(filePath, options, mergeResults, baseDir || dir);
		} else {
			next();
		}
	}

	function mergeResults(err, res) {
		if (err) {
			return callback(err);
		}
		list = list.concat(res);
		next();
	}
}

/**
 * Synchronous listAll().
 *
 * @param  {String}  dir
 * @param  {Object}  [options]
 * @param  {Boolean} [baseDir]
 *
 * @return {Array} List of files in dir.
 */
function listAllSync(dir, options, baseDir) {
	if (typeof options !== 'object') {
		baseDir = options;
		options = false;
	}
	var loadStats = options.recursive ||
		options.filter && options.filter.length > 1 ||
		options.map && options.map.length > 1;
	var list = [];
	var files = fs.readdirSync(dir);
	var file, filePath, stat;
	for (var i = 0, l = files.length; i < l; i++) {
		file = files[i];
		filePath = path.join(dir, file);
		if (loadStats) {
			stat = fs.statSync(filePath);
		}
		if (!options.filter || options.filter(filePath, stat)) {
			list.push(options.map ?
				options.map(filePath, stat) :
				options.prependDir ? filePath : path.relative(String(baseDir || dir), String(filePath)));
		}
		if (options.recursive && !stat.isFile()) {
			list = list.concat(listAllSync(filePath, options, baseDir || dir));
		}
	}
	return options.sort ? list.sort(typeof options.sort === 'function' ? options.sort : undefined) : list;
}

/**
 * List files and directories.
 *
 * @param  {String}   dir
 * @param  {Object}   [options]
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.listAll = function (dir, options, callback) {
	listAll(dir, options, callback);
};

/**
 * Synchronous fs.listAll().
 *
 * @param  {String} dir
 * @param  {Object} [options]
 *
 * @return {Array} List of files in dir.
 */
fs.listAllSync = function (dir, options) {
	return listAllSync(dir, options);
};

/**
 * Get the list of all files in a directory.
 *
 * @param  {String}   dir
 * @param  {Object}   [options]
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.listFiles = function (dir, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = false;
	}
	options = options || {};

	listAll(dir, extend({}, options, { filter: filter }), callback);

	function filter(filePath, stat) {
		return stat.isFile() && (!options.filter || options.filter(filePath, stat));
	}
};

/**
 * Synchronous fs.listFiles().
 *
 * @param  {String} dir
 * @param  {Object} [options]
 *
 * @return {Array} List of files in dir.
 */
fs.listFilesSync = function (dir, options) {
	options = options || {};

	function filter(filePath, stat) {
		return stat.isFile() && (!options.filter || options.filter(filePath, stat));
	}

	return listAllSync(dir, extend({}, options, { filter: filter }));
};

/**
 * List all directories.
 *
 * @param  {String}   dir
 * @param  {Object}   [options]
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.listDirs = function (dir, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = false;
	}
	options = options || {};

	listAll(dir, extend({}, options, { filter: filter }), callback);

	function filter(filePath, stat) {
		return !stat.isFile() && (!options.filter || options.filter(filePath, stat));
	}
};

/**
 * Synchronous fs.listDirs().
 *
 * @param  {String} dir
 * @param  {Object} [options]
 *
 * @return {Array} List of directories in dir.
 */
fs.listDirsSync = function (dir, options) {
	options = options || {};

	function filter(filePath, stat) {
		return !stat.isFile() && (!options.filter || options.filter(filePath, stat));
	}

	return listAllSync(dir, extend({}, options, { filter: filter }));
};

/**
 * Asynchronous walker core.
 *
 * @param  {String}   retriever
 * @param  {String}   dir
 * @param  {Object}   options
 * @param  {Function} callback
 *
 * @return {Void}
 */
function walk(retriever, dir, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = false;
	}
	var files, aborted, i, total;

	retriever(dir, options, start);

	function start(err, fls) {
		if (err) {
			return callback(err);
		}
		files = fls;
		total = fls.length;
		if (callback.length > 2) {
			i = 0;
			for (var t = 0, threads = Math.max(0|options.threads, 1); t < threads; t++) {
				next();
			}
		} else {
			for (var f = 0; f < total; f++) {
				callback(null, files[f]);
			}
		}
	}

	function next() {
		if (aborted || i >= total) {
			return;
		}
		callback(null, files[i++], next, abort);
	}

	function abort() {
		aborted = 1;
	}
}

/**
 * Synchronous walker core.
 *
 * @param  {String}   retriever
 * @param  {String}   dir
 * @param  {Object}   options
 * @param  {Function} callback
 *
 * @return {Void}
 */
function walkSync(retriever, dir, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = false;
	}
	var aborted;
	var files = retriever(dir, options);

	for (var f = 0, fl = files.length; f < fl; f++) {
		if (aborted) {
			break;
		}
		callback(files[f], abort);
	}

	function abort() {
		aborted = 1;
	}
}

/**
 * Walk through files and directories inside a directory.
 *
 * @param  {String}   dir
 * @param  {Object}   [options]
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.walkAll = function (dir, options, callback) {
	walk(fs.listAll, dir, options, callback);
};

/**
 * Synchronous fs.walkAll().
 *
 * @param  {String}   dir
 * @param  {Object}   [options]
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.walkAllSync = function (dir, options, callback) {
	walkSync(fs.listAllSync, dir, options, callback);
};

/**
 * Walk through files inside a directory.
 *
 * @param  {String}   dir
 * @param  {Object}   [options]
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.walkFiles = function (dir, options, callback) {
	walk(fs.listFiles, dir, options, callback);
};

/**
 * Synchronous fs.walkFiles().
 *
 * @param  {String}   dir
 * @param  {Object}   [options]
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.walkFilesSync = function (dir, options, callback) {
	walkSync(fs.listFilesSync, dir, options, callback);
};

/**
 * Walk through directories inside a directory.
 *
 * @param  {String}   dir
 * @param  {Object}   [options]
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.walkDirs = function (dir, options, callback) {
	walk(fs.listDirs, dir, options, callback);
};

/**
 * Synchronous fs.walkDirs().
 *
 * @param  {String}   dir
 * @param  {Object}   [options]
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.walkDirsSync = function (dir, options, callback) {
	walkSync(fs.listDirsSync, dir, options, callback);
};

/**
 * Synchronous fs.walkDir().
 *
 * @param  {String} dir
 * @param  {Object} [options]
 *
 * @return {Array} List of directories in dir.
 */
fs.listDirsSync = function (dir, options) {
	options = options || {};

	function filter(filePath, stat) {
		return !stat.isFile() && (!options.filter || options.filter(filePath, stat));
	}

	return listAllSync(dir, extend({}, options, { filter: filter }));
};

/**
 * Generates a unique path that won't override any other file.
 *
 * If path doesn't exist, it is simply returned. Otherwise it will try appending "-N"
 * suffix (starting at 2) after the file name (and before extension) until it finds a path that doesn't exist yet.
 *
 * Example (assuming "path.txt", and "path" files exist):
 *   path.txt => path-2.txt
 *   path     => path-2
 *
 * Usage:
 *   fs.uniquePath(path, function (uniquePath) {});
 *
 * @param  {String}   path
 * @param  {Integer}  [no]
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.uniquePath = function (path, no, callback) {
	if (typeof no === 'function') {
		callback = no;
		no = null;
	}
	no = no == null ? 2 : no;

	fs.exists(path, uniqefy);

	function uniqefy(exists) {
		if (exists) {
			fs.uniquePath(path.replace(/(?:-[0-9]+)?(\.[^ ]*)?$/i, '-' + no + '$1'), no + 1, callback);
		} else {
			callback(path);
		}
	}
};

/**
 * Synchronous fs.uniquePath().
 *
 * @param  {String}  path
 * @param  {Integer} no       Starting prefix number. Default: 2.
 *
 * @return {String} Unique path.
 */
fs.uniquePathSync = function (path, no) {
	no = no == null ? 2 : no;

	if (fs.existsSync(path)) {
		return fs.uniquePathSync(path.replace(/(?:-[0-9]+)?(\.[^ ]*)?$/i, '-' + no + '$1'), no+1);
	} else {
		return path;
	}
};

/**
 * Format data in JSON and write into file.
 *
 * Creates destination directory if it doesn't exist yet.
 *
 * @param  {String}   file
 * @param  {Mixed}    data
 * @param  {String}   [indentation] Number of spaces, or a direct representation
 *                                  of a single indentation level, like '\t'.
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.writeJSON = function (file, data, indentation, callback) {
	if (typeof indentation === 'function') {
		callback = indentation;
		indentation = undefined;
	}
	callback = norback(callback);
	fs.createFile(file, JSON.stringify(data, null, indentation), callback);
};

/**
 * Synchronous fs.writeJSON().
 *
 * @param  {String} file
 * @param  {Mixed}  data
 * @param  {String} [indentation]
 *
 * @return {Void}
 */
fs.writeJSONSync = function (file, data, indentation) {
	return fs.createFileSync(file, JSON.stringify(data, null, indentation));
};

/**
 * Read JSON file.
 *
 * @param  {String}   file
 * @param  {Function} callback
 *
 * @return {Void}
 */
fs.readJSON = function (file, callback) {
	fs.readFile(file, parseJSON);

	function parseJSON(err, data) {
		if (err) {
			return callback(err);
		}
		callback(null, JSON.parse(String(data)));
	}
};

/**
 * Synchronous fs.readJSON().
 *
 * @param  {String} file
 *
 * @return {Object}
 */
fs.readJSONSync = function (file) {
	return JSON.parse(String(fs.readFileSync(file)));
};

// Aliases
fs.ensureDir = fs.createDir;
fs.ensureDirSync = fs.createDirSync;
fs.writeJson = fs.writeJSON;
fs.writeJsonSync = fs.writeJSONSync;
fs.readJson = fs.readJSON;
fs.readJsonSync = fs.readJSONSync;
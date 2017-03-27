# fs-extended [![Build Status](https://secure.travis-ci.org/darsain/fs-extended.png?branch=master)](http://travis-ci.org/darsain/fs-extended) [![NPM version](https://badge.fury.io/js/fs-extended.png)](https://npmjs.org/package/fs-extended)

**THIS MODULE IS DEPRECATED! USE [fs-extra](https://www.npmjs.com/package/fs-extra) INSTEAD.**

Node.js module that extends the native `fs` with convenient methods.

#### Dependencies

None.

### [Changelog](https://github.com/darsain/fs-extended/wiki/Changelog)

Upholds the [Semantic Versioning Specification](http://semver.org/).

## Installation

```
npm install fs-extended
```

## Usage

```js
var fs = require('fs-extended');

fs.listFiles('foo', { recursive: 1 }, function (err, files) {
	console.log(err, files);
});
```

## Methods

All methods from native [`fs`](http://nodejs.org/api/fs.html) module are available.

### fs.createFile(path, data, [mode], [callback]);

Creates a new, or overrides an existing file. Creates any missing parent directories.

- **path** `String` Path to a file.
- **data** `String|Buffer` Contents of a new file.
- **[options]** `Object` Object with options (will be passed to `fs.writeFile`):
	- *encoding* `String|Null` File encoding. Defaults to `utf8`.
	- *mode* `Number` File mode. Defaults to `0666`. The final mode is dependent on process `umask`.
	- *flag* `String` File open flag. Defaults to `w`.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.createFileSync(path, data, [mode]);

Synchronous `fs.createFile()`;

### fs.ensureFile(path, [mode], [callback]);

Ensures file exists. If it does, it'll only ensure file `mode` (when passed). If it doesn't, it'll create an empty file.
Creates any missing parent directories.

- **path** `String` Path to a file.
- **[mode]** `Object` File mode. Defaults to `0666`. The final mode is dependent on process `umask`.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.ensureFileSync(path, [mode]);

Synchronous `fs.ensureFile()`;

### fs.copyFile(oldPath, newPath, [callback]);

Copies a file from one location to another. Creates any missing destination directories, and works between
different partitions/filesystems. Also makes sure that file `mode` is preserved.

- **oldPath** `String` Path to original file.
- **newPath** `String` Destination path.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.copyFileSync(oldPath, newPath);

Synchronous `fs.copyFile()`;

### fs.moveFile(oldPath, newPath, [callback]);

Moves a file from one location to another. Creates any missing destination directories, and works between
different partitions/filesystems. Also makes sure that file `mode` is preserved.

- **oldPath** `String` Path to original file.
- **newPath** `String` Destination path.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.moveFileSync(oldPath, newPath);

Synchronous `fs.moveFile()`;

### fs.emptyFile(file, [callback]);

Deletes all contents of a file. When file doesn't exist, it is created with a default mode `0666`.

A mere alias of `fs.truncate(file, 0, callback)` with an optional callback for API consistency.

- **file** `String` Path to a file.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.emptyFileSync(file, [callback]);

Synchronous `fs.emptyFile()`;

### fs.deleteFile(file, [callback]);

Deletes a file. Doesn't throw an error when file doesn't exist.

A mere alias of `fs.unlink(file, callback)` with ignored `ENOENT` error and an optional callback for API consistency.

- **file** `String` Path to a file.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.deleteFileSync(file, [callback]);

Synchronous `fs.deleteFile()`;

---

### fs.createDir(dir, [mode], [callback]);

Creates a directory, and any missing parent directories. If directory exists, it only ensures `mode` (when passed).

- **dir** `String` Path to a new directory.
- **[mode]** `Object` Directory mode. Defaults to `0777`. The final mode is dependent on process `umask`.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.createDirSync(dir, [mode]);

Synchronous `fs.createDir()`;

### fs.ensureDir(oldPath, newPath, [callback]);

Alias of `fs.createDir()` for API consistency.

### fs.ensureDirSync(oldPath, newPath);

Alias of `fs.createDirSync()` for API consistency.

### fs.copyDir(oldPath, newPath, [callback]);

Copies a directory and everything in it from one location to another. Creates any missing destination directories, and
works between different partitions/filesystems. Also makes sure that `mode` of all items is preserved.

- **oldPath** `String` Path to original directory.
- **newPath** `String` Destination path.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.copyDirSync(oldPath, newPath);

Synchronous `fs.copyDir()`;

### fs.moveDir(oldPath, newPath, [callback]);

Moves a directory and everything in it from one location to another. Creates any missing destination directories, and
works between different partitions/filesystems. Also makes sure that `mode` of all items is preserved.

- **oldPath** `String` Path to original directory.
- **newPath** `String` Destination path.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.moveDirSync(oldPath, newPath);

Synchronous `fs.moveDir()`;

### fs.emptyDir(dir, [callback]);

Deletes everything inside a directory, but keeps the directory itself.

- **dir** `String` Path to directory.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.emptyDirSync(dir);

Synchronous `fs.emptyDir()`;

### fs.deleteDir(dir, [callback]);

Deletes a directory and everything inside it.

- **dir** `String` Path to directory.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.deleteDirSync(dir);

Synchronous `fs.deleteDir()`;

---

### fs.copy(oldPath, newPath, [callback]);

Copy based on a type of the original item. Bridges to `fs.copyFile()` when `oldPath` is a file, or `fs.copyDir()` when
it's a directory.

- **oldPath** `String` Path to a file or a directory.
- **newPath** `String` Destination path.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.copySync(oldPath, newPath);

Synchronous `fs.copy()`;

### fs.move(oldPath, newPath, [callback]);

Move based on a type of the original item. Bridges to `fs.moveFile()` when `oldPath` is a file, or `fs.moveDir()` when
it's a directory.

- **oldPath** `String` Path to a file or a directory.
- **newPath** `String` Destination path.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.moveSync(oldPath, newPath);

Synchronous `fs.move()`;

### fs.empty(target, [callback]);

Empty based on a type of the original item. Bridges to `fs.emptyFile()` when `target` is a file, or `fs.emptyDir()` when
it's a directory.

- **target** `String` Path to a file or a directory.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.emptySync(target);

Synchronous `fs.empty()`;

### fs.delete(target, [callback]);

Delete based on a type of the original item. Bridges to `fs.deleteFile()` when `target` is a file, or `fs.deleteDir()`
when it's a directory.

- **target** `String` Path to a file or a directory.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

### fs.deleteSync(target);

Synchronous `fs.delete()`;

---

### fs.listAll(dir, [options], [callback]);

List all directories and files inside a directory.

- **dir** `String` Path to a directory.
- **[options]** `Object` Object with options:
	- *recursive* `Boolean` List items recursively, expanding all child directories. Defaults to `false`.
	- *prependDir* `Boolean` Prepend `dir` path before every item in final array. Defaults to `false`.
	- *filter* `Function` Function to filter items. Should return `true` or `false`. Receives arguments:
		- *itemPath* `String` Full path to an item.
		- *stat* [`fs.Stats`](http://nodejs.org/api/fs.html#fs_class_fs_stats) Object with data about a file.
	- *map* `Function` Function to map final list items. Mapping is applied after *filter*. Receives arguments:
		- *itemPath* `String` Full path to an item.
		- *stat* [`fs.Stats`](http://nodejs.org/api/fs.html#fs_class_fs_stats) Object with data about a file.
	- *sort* `Boolean | Function` Pass `true` to sort files
		[lexicographically](http://en.wikipedia.org/wiki/Lexicographical_order), or a compare function you'd normally
		pass to an `Array.sort()`. Sorting is applied after *filter* & *map*. Function accepts two file paths (or
		whatever *map* returned) for comparison.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.
	- *list* `Array` List of items inside a directory.

The purpose of built-in filter/map functions is to recycle `fs.Stats` objects when needed, as loading this objects is
the biggest bottleneck when listing files recursively.

The `fs.Stats` for each file is loaded only when recursive listing is requested, or filter/map functions accept it as an
argument.

On the other hand, if your filter/map needs something that `fs.Stat` provides, just use it. There is no way how to make
data retrieval by `fs.stat()` faster (I'd like to be corrected on this if I'm wrong! :)).

##### Examples

Filter out directories, effectively turning `fs.listAll()` into `fs.listFiles()`:

```js
function filter(itemPath, stat) {
	return stat.isFile();
}

fs.listAll(dir, { filter: filter }, function (err, files) {
	console.log(err);   // possible exception
	console.log(files); // array of all files inside a directory
});
```

Map files into a more descriptive array of objects:

```js
function map(itemPath, stat) {
	return {
		path: itemPath,
		name: path.basename(itemPath),
		ext: path.extname(itemPath),
		size: stat.size,
	};
}

fs.listAll(dir, { map: map }, function (err, files) {
	console.log(err);   // possible exception
	console.log(files); // array of file object descriptors returned by map()
	// Example
	files[0].path; // 1st file's path
	files[0].ext;  // 1st file's extension
});
```

Sort files by their name [lexicographically](http://en.wikipedia.org/wiki/Lexicographical_order):

```js
fs.listAll(dir, { sort: true }, function (err, files) {
	console.log(err);   // possible exception
	console.log(files); // sorted array of files
});
```

Sort files by their extension with a compare function:

```js
function compare(a, b) {
	return path.extname(a) < path.extname(b) ? -1 : 1;
}

fs.listAll(dir, { sort: compare }, function (err, files) {
	console.log(err);   // possible exception
	console.log(files); // sorted array of files
});
```

### fs.listAllSync(dir, [options]);

Synchronous `fs.listAll()`;

### fs.listFiles(dir, [options], callback);

List all files inside a directory.

- **dir** `String` Path to a directory.
- **[options]** `Object` Object with options:
	- *recursive* `Boolean` List files recursively, expanding all child directories. Defaults to `false`.
	- *prependDir* `Boolean` Prepend `dir` path before every item in final array. Defaults to `false`.
	- *filter* `Function` Function to filter items. Should return `true` or `false`. Receives arguments:
		- *filePath* `String` Full path to a file.
		- *stat* [`fs.Stats`](http://nodejs.org/api/fs.html#fs_class_fs_stats) Object with data about a file.
	- *map* `Function` Function to map final list items. Mapping is applied after *filter*. Receives arguments:
		- *filePath* `String` Full path to a file.
		- *stat* [`fs.Stats`](http://nodejs.org/api/fs.html#fs_class_fs_stats) Object with data about a file.
	- *sort* `Boolean | Function` Pass `true` to sort files
		[lexicographically](http://en.wikipedia.org/wiki/Lexicographical_order), or a compare function you'd normally
		pass to an `Array.sort()`. Sorting is applied after *filter* & *map*. Function accepts two file paths (or
		whatever *map* returned) for comparison.
- **callback** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.
	- *files* `Array` List of files inside a directory.

##### Examples

List all files in a directory recursively, and sort them by size:

```js
function map(filePath, stat) {
	return {
		path: filePath,
		size: stat.size,
	};
}

function compare(a, b) {
	return a.size < b.size ? -1 : 1;
}

fs.listAll(dir, { map: map, sort: compare }, function (err, files) {
	console.log(err);   // possible exception
	console.log(files); // array of file object descriptors returned by map()
	// Example
	files[0].path; // 1st file's path
	files[0].size; // 1st file's size
});
```

### fs.listFilesSync(dir, [options]);

Synchronous `fs.listFiles()`;

### fs.listDirs(dir, [options], callback);

List all directories inside a directory.

- **dir** `String` Path to a directory.
- **[options]** `Object` Object with options:
	- *recursive* `Boolean` List directories recursively, expanding all child directories. Defaults to `false`.
	- *prependDir* `Boolean` Prepend `dir` path before every directory in final array. Defaults to `false`.
	- *filter* `Function` Function to filter items. Function should return `true` or `false`. Receives arguments:
		- *dirPath* `String` Full path to a directory.
		- *stat* [`fs.Stats`](http://nodejs.org/api/fs.html#fs_class_fs_stats) Object with data about a directory.
	- *map* `Function` Function to map final list items. Mapping is applied after *filter*. Receives arguments:
		- *dirPath* `String` Full path to a directory.
		- *stat* [`fs.Stats`](http://nodejs.org/api/fs.html#fs_class_fs_stats) Object with data about a directory.
	- *sort* `Boolean | Function` Pass `true` to sort directories
		[lexicographically](http://en.wikipedia.org/wiki/Lexicographical_order), or a compare function you'd normally
		pass to an `Array.sort()`. Sorting is applied after *filter* & *map*. Function accepts two directory paths (or
		whatever *map* returned) for comparison.
- **callback** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.
	- *dirs* `Array` List of directories inside a directory.

##### Examples

List all directories in a directory recursively, and sort them by modification time:

```js
function map(dirPath, stat) {
	return {
		path: dirPath,
		mtime: stat.mtime,
	};
}

function compare(a, b) {
	return a.mtime < b.mtime ? -1 : 1;
}

fs.listAll(dir, { map: map, sort: compare }, function (err, files) {
	console.log(err);   // possible exception
	console.log(files); // array of file object descriptors returned by map()
	// Example
	files[0].path;  // 1st directory's path
	files[0].mtime; // 1st directory's mtime
});
```

### fs.listDirsSync(dir, [options]);

Synchronous `fs.listDirs()`;

---

### fs.uniquePath(path, [no], callback);

Generates a unique path that won't override any other file.

If path doesn't exist, it is simply returned. Otherwise it will insert "-N" suffix between the file
name and its extension (if there is any) until it finds a path that doesn't exist yet.

**Be aware of [Race condition](http://en.wikipedia.org/wiki/Race_condition)!**

- **path** `String` Path to be uniquefied.
- **[no]** `Integer` Starting number index. Defaults to `2`.
- **callback** `Function` Receives arguments:
	- *uniquePath* `String` Unique version of the original path.

##### Example

With a directory structure:

```
dir
├─ foo
├─ bar.txt
├─ bar-2.txt
├─ bar-3.txt
└─ baz.tar.gz
```

These are the outputs:

```js
fs.uniquePath('dir/unique', function (uniquePath) {
	uniquePath; // => dir/unique
});
```

```js
fs.uniquePath('dir/foo', function (uniquePath) {
	uniquePath; // => dir/foo-2
});
```

```js
fs.uniquePath('dir/bar.txt', function (uniquePath) {
	uniquePath; // => dir/bar-4.txt
});
```

```js
fs.uniquePath('dir/baz.tar.gz', function (uniquePath) {
	uniquePath; // => dir/baz-2.tar.gz
});
```

### fs.uniquePathSync(path, [no]);

Synchronous `fs.uniquePath()`;

### fs.writeJSON(file, data, [indentation], [callback]);

Format data in JSON and write into a file. Creates destination directory if it doesn't exist yet.

- **file** `String` Path to a destination file.
- **data** `Mixed` Data to be formated in JSON.
- **[indentation]** `Mixed` Number of spaces, or a direct representation of a single indentation level, like '\t'.
	Defaults to no indentation.
- **[callback]** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.

Alias: `fs.writeJson()`

### fs.writeJSONSync(file, data, [indentation]);

Synchronous `fs.writeJSON()`;

Alias: `fs.writeJsonSync()`

### fs.readJSON(file, callback);

Read data from JSON file.

- **file** `String` Path to a JSON file.
- **callback** `Function` Receives arguments:
	- *err* `Mixed` Error object on error, `null` otherwise.
	- *data* `Mixed` Data from JSON file.

Alias: `fs.readJson()`

### fs.readJSONSync(file);

Synchronous `fs.readJSON()`;

Alias: `fs.readJsonSync()`
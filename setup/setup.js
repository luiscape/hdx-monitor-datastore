//
// Creating the data directory.
//
var mkdirp = require('mkdirp')

module.exports = {

  createDataFolder: function (instance, verbose) {

    //
    // Tries to load the instance.
    //
    try {
      var data_folder = require('../config/' + instance).DataFolder
    }
    catch (err) {
      if (verbose) {
        console.log(err)
      }
      return false
    }
    
    //
    // Proceeds to create a folder.
    //
    mkdirp(data_folder, function (err) {
      if (err) {
        console.log('Could not create ' + data_folder + ' directory.')
        if (verbose) {
          console.error(err)
        }
        return false
      } else {
        if (verbose) {
          console.log(data_folder + ' directory created successfully.')
        }
      }
    })
  }

}

//
// Invoking function.
//
var main = function(){
    createDataFolder(process.argv[2])
}

if (require.main === module) {
    main()
}

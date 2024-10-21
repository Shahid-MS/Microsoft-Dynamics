var facultyMainFormSampleData = {
  onLoad: function createMultipleFacultyRecords() {
    // Define the entity logical name
    var entityName = "ms_faculty";

    // Generate 50 faculty records with dummy data
    var facultyMembers = [];
    for (var i = 1; i <= 50; i++) {
      facultyMembers.push({
        ms_name: "Faculty " + i,
        ms_mobile: "98765432" + (i < 10 ? "0" + i : i), // Generating unique mobile numbers
        ms_yearsofexperience: (i % 20) + 1, // Years of experience between 1 and 20
        ms_email: "faculty" + i + "@example.com", // Generating unique emails
      });
    }

    // Iterate over the array and create each faculty record
    facultyMembers.forEach(function (faculty) {
      Xrm.WebApi.createRecord(entityName, faculty).then(
        function success(result) {
          console.log("Record created with ID: " + result.id);
        },
        function (error) {
          console.log("Error: " + error.message);
        }
      );
    });
  },
};

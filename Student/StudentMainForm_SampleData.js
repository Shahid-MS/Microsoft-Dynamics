var studentMainFormSampleData = {
  onLoad: function createMultipleStudentRecords() {
    // Define the entity logical name
    var entityName = "ms_student";

    // Generate 50 student records with dummy data
    var students = [];
    for (var i = 1; i <= 50; i++) {
      students.push({
        ms_name: "Student " + i,
        ms_mobile: "12345678" + (i < 10 ? "0" + i : i), // Generating unique mobile numbers
        ms_email: "student" + i + "@gmail.com", // Generating unique emails
        ms_address: "Address " + i,
      });
    }

    // Iterate over the array and create each student record
    students.forEach(function (student) {
      Xrm.WebApi.createRecord(entityName, student).then(
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

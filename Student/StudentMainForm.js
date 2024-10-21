var studentMainForm = {
  formContext: null,
  formMode: null,

  onLoad: function (executionContext) {
    formContext = executionContext.getFormContext();
    formMode = formContext.ui.getFormType();

    //Calculate Duration Field
    this.courseDurationAndFee();
    //Scholarship Eligibility
    this.checkScholarshipEligibility();
  },

  onSave: function (executionContext) {
    formContext = executionContext.getFormContext();
    formMode = formContext.ui.getFormType();

    this.checkScholarshipEligibility();
  },



  courseDurationAndFee: function () {
    // Get the selected course
    var selectedCourse = formContext
      .getAttribute("ms_courseenrolled")
      .getValue();

    if (selectedCourse != null) {
      // Extract the course ID from the selected course
      var selectedCourseId = selectedCourse[0].id;

      // Use Xrm.WebApi to retrieve the course record
      Xrm.WebApi.retrieveRecord(
        "ms_course",
        selectedCourseId,
        "?$select=ms_durationinmonths,ms_coursefee"
      ).then(
        function success(result) {
          // Get the duration from the result
          var duration = result["ms_durationinmonths"] + " months";
          var courseFee = result["ms_coursefee"];
          //   alert("duration " + duration);

          // Set the program duration field value
          formContext
            .getAttribute("ms_courseduration")
            .setValue(duration.toString());
          formContext.getAttribute("ms_coursefee").setValue(courseFee);

          // Make the field visible
          formContext.getControl("ms_courseduration").setVisible(true);
          formContext.getControl("ms_coursefee").setVisible(true);
        },
        function error(err) {
          alert("error occured");
          console.log(err);
        }
      );
    } else {
      // Hide the program duration field if no course is selected
      formContext.getControl("ms_courseduration").setVisible(false);
      formContext.getControl("ms_coursefee").setVisible(false);
    }
  },

  checkScholarshipEligibility: function () {
    // alert("Checking eligibility");
    // Get the student's 12 Marks value
    var marks = formContext.getAttribute("ms_thmarksin").getValue();

    // Check if the marks are valid
    if (marks != null) {
      // Determine eligibility based on marks
      var isEligible = marks >= 80 ? 1 : 0; //

      // Set the "Eligible for Scholarship" field with the correct value
      formContext
        .getAttribute("ms_eligibleforscholarship")
        .setValue(isEligible);
    }
  },

  //Fee Creation and updation
  onRegistrationCompletecreateFeeOrUpdate: function () {
    var registrationCompleted = formContext
      .getAttribute("ms_registrationcompleted")
      .getValue();

    // alert("registrationComplete: " + registrationCompleted);

    // Get the selected Course lookup value
    var courseLookup = formContext.getAttribute("ms_courseenrolled").getValue();
    console.log(courseLookup);

    if (courseLookup != null) {
      var courseId = courseLookup[0].id
        .replace("{", "")
        .replace("}", "")
        .toLowerCase(); // Get the selected Course ID
      // alert("Course ID: " + courseId);

      // Declare courseName and courseFee
      var courseName;
      var courseFee;

      // Fetch course details
      Xrm.WebApi.retrieveRecord(
        "ms_course",
        courseId,
        "?$select=ms_name,ms_coursefee"
      )
        .then(function success(courseResult) {
          courseName = courseResult.ms_name;
          courseFee = courseResult.ms_coursefee;
          console.log("Course Name: " + courseName);
          console.log("Course Fee: " + courseFee);

          // Proceed to check if Fee record exists for the student
          var query =
            "?$filter=ms_studentid eq '" +
            formContext.getAttribute("ms_student_id").getValue() +
            "'";

          return Xrm.WebApi.retrieveMultipleRecords("ms_fee", query);
        })
        .then(function (result) {
          if (registrationCompleted === 1) {
            if (result.entities.length > 0) {
              // If fee record exists, update it
              var feeRecordId = result.entities[0].ms_feeid;
              var updatedFeeRecord = {
                ms_feeamount: courseFee,
                ms_coursename: courseName,
                ms_scholarshipamount: formContext
                  .getAttribute("ms_scholarshipamount")
                  .getValue(),
                ms_name:
                  formContext.getAttribute("ms_name").getValue() +
                  " " +
                  courseName +
                  " Bill",
              };

              return Xrm.WebApi.updateRecord(
                "ms_fee",
                feeRecordId,
                updatedFeeRecord
              ).then(function success() {
                console.log("Fee record updated with ID: " + feeRecordId);
                alert(
                  "Fee record updated successfully with ID: " + feeRecordId
                );
              });
            } else {
              // No Fee record exists, create a new one
              var feeRecord = {
                ms_feeamount: courseFee,
                ms_coursename: courseName,
                ms_scholarshipamount: formContext
                  .getAttribute("ms_scholarshipamount")
                  .getValue(),
                ms_studentid: formContext
                  .getAttribute("ms_student_id")
                  .getValue(),
                ms_studentname: formContext.getAttribute("ms_name").getValue(),
                ms_name:
                  formContext.getAttribute("ms_name").getValue() +
                  " " +
                  courseName +
                  " Bill",
              };

              return Xrm.WebApi.createRecord("ms_fee", feeRecord).then(
                function success(result) {
                  console.log("Fee record created with ID: " + result.id);
                  alert(
                    "Fee record created successfully with ID: " + result.id
                  );

                  var paymentDetailsLookup = [
                    {
                      id: result.id,
                      entityType: "ms_fee",
                    },
                  ];

                  formContext
                    .getAttribute("ms_paymentdetails")
                    .setValue(paymentDetailsLookup);
                  formContext
                    .getControl("ms_registrationcompleted")
                    .setDisabled(true);
                }
              );
            }
          } else if (registrationCompleted === 0) {
            // If registration is not completed (== 0), delete the fee record if it exists
            if (result.entities.length > 0) {
              var feeRecordId = result.entities[0].ms_feeid;

              return Xrm.WebApi.deleteRecord("ms_fee", feeRecordId)
                .then(function success() {
                  console.log("Fee record deleted with ID: " + feeRecordId);
                  alert(
                    "Fee record deleted successfully with ID: " + feeRecordId
                  );
                })
                .catch(function (error) {
                  console.log("Error deleting fee record: " + error.message);
                });
            } else {
              console.log("No fee record found to delete.");
            }
          }
        })
        .catch(function (error) {
          alert("Error checking or updating fee record");
          console.log("Error: " + error.message);
        });
    }
  },
};

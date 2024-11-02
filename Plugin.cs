using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;

namespace studentedu
{
    public class CalculateScholarshipAmount : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // Obtain the tracing service
            ITracingService tracingService =
            (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            // Obtain the execution context from the service provider.  
            IPluginExecutionContext context = (IPluginExecutionContext)
                serviceProvider.GetService(typeof(IPluginExecutionContext));

            // The InputParameters collection contains all the data passed in the message request.  
            if (context.InputParameters.Contains("Target") &&
                context.InputParameters["Target"] is Entity)
            {
                // Obtain the target entity from the input parameters.  
                Entity studentEntity = (Entity)context.InputParameters["Target"];
                tracingService.Trace("Plugin triggered.");

                // Obtain the IOrganizationService instance which you will need for  
                // web service calls.  
                IOrganizationServiceFactory serviceFactory =
                    (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

                try
                {
                    Guid studentId = studentEntity.Id;

                    ColumnSet columns = new ColumnSet("ms_thmarksin", "ms_coursefee");
                    Entity retrievedStudent = service.Retrieve("ms_student", studentId, columns);
                    if (retrievedStudent != null)
                    {
                        if (retrievedStudent.Contains("ms_thmarksin") && retrievedStudent.Contains("ms_coursefee"))
                        {
                            tracingService.Trace("ms_thmarksin retrieved and ms_coursefee retrieved.");

                            int marks = (int)retrievedStudent["ms_thmarksin"];
                            Money courseFeeMoney = (Money)retrievedStudent["ms_coursefee"];
                            decimal courseFee = courseFeeMoney.Value;
                            decimal scholarshipAmount = 0;

                            if (marks > 90)
                            {
                                scholarshipAmount = courseFee * 0.4m;
                                tracingService.Trace($"Scholarship set to 40%. Amount: {scholarshipAmount}");
                            }
                            else if (marks <= 90 && marks > 80)
                            {
                                scholarshipAmount = courseFee * 0.2m;
                                tracingService.Trace($"Scholarship set to 20%. Amount: {scholarshipAmount}");
                            }
                            else
                            {
                                tracingService.Trace("Marks below 80, no scholarship awarded.");
                            }
                            Entity updateStudent = new Entity("ms_student", studentEntity.Id);
                            updateStudent["ms_scholarshipamount"] = scholarshipAmount;
                            tracingService.Trace("Updating scholarship amount");
                            service.Update(updateStudent);
                            tracingService.Trace("Updated scholarship successfully");
                        }
                        else
                        {
                            tracingService.Trace("Either ms_thmarksin or ms_coursefee is not present.");
                        }

                    }
                    else
                    {
                        tracingService.Trace("Student entity not found.");
                    }
                }
                catch (Exception ex)
                {
                    tracingService.Trace("Scholarship Amount", ex.ToString());
                    throw;
                }
        
            }

        }
    }
}

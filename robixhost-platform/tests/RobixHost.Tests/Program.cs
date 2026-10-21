using RobixHost.Tests;

// Dependency-free test runner (the dev workspace has no NuGet access, so no xUnit/NUnit).
// Usage: dotnet run --project tests/RobixHost.Tests -- [group-filter]
// Set ROBIX_TEST_REPORT=<file> to also write the result lines to a file.
var runner = new Runner();
UnitTests.Register(runner);
IntegrationTests.Register(runner);
ClientTests.Register(runner);
DesktopTests.Register(runner);
StorageTests.Register(runner);
LiveTests.Register(runner);
return await runner.RunAsync(args.FirstOrDefault());

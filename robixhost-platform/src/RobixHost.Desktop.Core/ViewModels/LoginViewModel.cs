using RobixHost.Client;
using RobixHost.Desktop.Mvvm;
using RobixHost.Desktop.Services;

namespace RobixHost.Desktop.ViewModels;

public interface IApiFactory { IRobixApi Create(Uri baseAddress); }

public sealed class LoginViewModel : ObservableObject
{
    private readonly IApiFactory _factory;
    private readonly Localizer _loc;
    private string _server = "", _username = "", _password = "";
    private string? _error;

    public LoginViewModel(IApiFactory factory, Localizer loc)
    {
        _factory = factory; _loc = loc;
        LoginCommand = new AsyncCommand(LoginAsync, onError: ex => Error = ex.Message);
    }

    public string Server { get => _server; set => SetProperty(ref _server, value); }
    public string Username { get => _username; set => SetProperty(ref _username, value); }
    /// <summary>Held only for the duration of the sign-in attempt, then cleared.</summary>
    public string Password { get => _password; set => SetProperty(ref _password, value); }
    public string? Error { get => _error; private set => SetProperty(ref _error, value); }
    public AsyncCommand LoginCommand { get; }

    /// <summary>Raised on success with the signed-in client and the server it is bound to.</summary>
    public event Action<IRobixApi, Uri>? SignedIn;

    private async Task LoginAsync(CancellationToken ct)
    {
        Error = null;
        if (!ServerAddress.TryNormalize(Server, out var uri, out var key)) { Error = _loc[key]; return; }
        if (Username.Trim().Length == 0 || Password.Length == 0) { Error = _loc["login.needCredentials"]; return; }

        var api = _factory.Create(uri);
        try
        {
            await api.LoginAsync(Username.Trim(), Password, ct);
            SignedIn?.Invoke(api, uri);
        }
        catch (ApiException ex)
        {
            // invalid_credentials gets a deliberately generic server message; transport errors get actionable text.
            Error = $"{_loc["login.failed"]}: {ex.Detailed}";
        }
        finally { Password = ""; }
    }
}

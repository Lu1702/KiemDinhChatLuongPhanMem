namespace backend.Helper;

public class GenerateEmailCodeHelper
{
    public static string GenerateEmailCode()
    {
        Random rnd = new Random();
        string rand = rnd.Next(100000, 999999).ToString();
        return rand;
    }
}
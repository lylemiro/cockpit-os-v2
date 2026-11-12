using System;
using System.Diagnostics;
using System.IO;

namespace CockpitOS
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string batPath = Path.Combine(baseDir, "Launch_Cockpit_OS.bat");

            if (!File.Exists(batPath))
            {
                Console.Error.WriteLine("Launch_Cockpit_OS.bat not found in: " + baseDir);
                return;
            }

            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = "/c \"\"" + batPath + "\"\"",
                WorkingDirectory = baseDir,
                UseShellExecute = false,
                CreateNoWindow = false
            };

            Process.Start(psi);
        }
    }
}


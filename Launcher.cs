using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows.Forms;

[assembly: AssemblyTitle("Cockpit OS")]
[assembly: AssemblyDescription("Cockpit OS v2.4.0 — Enterprise Zero-Trust Coliseum Arena Environment")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("Cockpit OS Coliseum Architecture")]
[assembly: AssemblyProduct("Cockpit OS")]
[assembly: AssemblyCopyright("Copyright © 2026")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]
[assembly: ComVisible(false)]
[assembly: AssemblyVersion("2.4.0.0")]
[assembly: AssemblyFileVersion("2.4.0.0")]

namespace CockpitOS
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string batPath = Path.Combine(baseDir, "Launch_Cockpit_OS.bat");

                if (!File.Exists(batPath))
                {
                    MessageBox.Show(
                        "Launch_Cockpit_OS.bat could not be found in:\n" + baseDir,
                        "Cockpit OS — Boot Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c \"" + batPath + "\"",
                    WorkingDirectory = baseDir,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true,
                    UseShellExecute = true
                };

                Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Unable to launch Cockpit OS:\n" + ex.Message,
                    "Cockpit OS Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}


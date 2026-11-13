using System;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
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
        private static bool IsPortOpen(string host, int port)
        {
            try
            {
                using (var client = new TcpClient())
                {
                    var result = client.BeginConnect(host, port, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(800);
                    if (!success) return false;
                    client.EndConnect(result);
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        private static string FindBrowserExecutable()
        {
            string programFilesX86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
            string programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);

            string[] candidatePaths = new string[]
            {
                Path.Combine(programFilesX86, @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(programFiles, @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(programFilesX86, @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(programFiles, @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(localAppData, @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(localAppData, @"Microsoft\Edge\Application\msedge.exe")
            };

            foreach (var path in candidatePaths)
            {
                if (File.Exists(path)) return path;
            }

            return null;
        }

        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string batPath = Path.Combine(baseDir, "Launch_Cockpit_OS.bat");

                // Check if port 4000 daemon is already listening
                bool daemonRunning = IsPortOpen("127.0.0.1", 4000);

                if (!daemonRunning && File.Exists(batPath))
                {
                    // Run batch file to ensure dependencies and launch kernel daemon
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        Arguments = "/c \"" + batPath + "\"",
                        WorkingDirectory = baseDir,
                        WindowStyle = ProcessWindowStyle.Hidden,
                        CreateNoWindow = true,
                        UseShellExecute = false
                    };
                    Process.Start(psi);
                    return;
                }

                // If daemon is already running or ready, launch browser directly in Kiosk Fullscreen
                string browserPath = FindBrowserExecutable();
                string targetUrl = "http://127.0.0.1:4000";

                if (!string.IsNullOrEmpty(browserPath))
                {
                    bool isEdge = browserPath.IndexOf("msedge.exe", StringComparison.OrdinalIgnoreCase) >= 0;
                    string args = isEdge
                        ? "--kiosk \"" + targetUrl + "\" --edge-kiosk-type=fullscreen --no-first-run"
                        : "--kiosk \"" + targetUrl + "\" --no-first-run";

                    ProcessStartInfo browserPsi = new ProcessStartInfo
                    {
                        FileName = browserPath,
                        Arguments = args,
                        WorkingDirectory = baseDir,
                        UseShellExecute = false
                    };
                    Process.Start(browserPsi);
                }
                else if (File.Exists(batPath))
                {
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        Arguments = "/c \"" + batPath + "\"",
                        WorkingDirectory = baseDir,
                        WindowStyle = ProcessWindowStyle.Hidden,
                        CreateNoWindow = true,
                        UseShellExecute = false
                    };
                    Process.Start(psi);
                }
                else
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = targetUrl,
                        UseShellExecute = true
                    });
                }
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

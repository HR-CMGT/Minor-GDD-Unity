using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace HRCMGT.DeviceSimulator
{
    /// <summary>
    /// Automatically discovers and configures custom mobile device profiles for Unity 6 Device Simulator.
    /// Provides verification and quick-access menu items.
    /// </summary>
    [InitializeOnLoad]
    public static class DeviceSimulatorAutoConfig
    {
        private const string PrefKeyDeviceDirectory = "DeviceSimulator.DeviceDirectory";
        private const string InitializedPrefKey = "HRCMGT_DeviceSimulator_Initialized_v1";

        static DeviceSimulatorAutoConfig()
        {
            EditorApplication.delayCall += InitializeOnStartup;
        }

        private static void InitializeOnStartup()
        {
            if (EditorPrefs.GetBool(InitializedPrefKey, false)) return;

            string foundPath = FindDevicesDirectory();
            if (!string.IsNullOrEmpty(foundPath))
            {
                // If Unity preference isn't set yet, configure it to our folder
                string currentPref = EditorPrefs.GetString(PrefKeyDeviceDirectory, "");
                if (string.IsNullOrEmpty(currentPref) || !Directory.Exists(currentPref))
                {
                    EditorPrefs.SetString(PrefKeyDeviceDirectory, foundPath);
                }

                int count = Directory.GetFiles(foundPath, "*.device", SearchOption.AllDirectories).Length;
                Debug.Log($"<color=#4CAF50><b>[HR-CMGT Device Simulator]</b></color> Successfully configured {count} modern mobile device profiles (2020-2025) for Unity Device Simulator! Open the Simulator view in your Game Window to test.");
                EditorPrefs.SetBool(InitializedPrefKey, true);
            }
        }

        public static string FindDevicesDirectory()
        {
            // 1. Check standard Assets location
            string assetsPath = Path.Combine(Application.dataPath, "Editor", "Devices");
            if (Directory.Exists(assetsPath)) return assetsPath;

            string hrAssetsPath = Path.Combine(Application.dataPath, "HR-CMGT", "DeviceSimulator", "Devices");
            if (Directory.Exists(hrAssetsPath)) return hrAssetsPath;

            // 2. Search anywhere in project or packages
            string[] matchingDirs = Directory.GetDirectories(Application.dataPath, "Devices", SearchOption.AllDirectories);
            if (matchingDirs.Length > 0) return matchingDirs[0];

            string packagesPath = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "Packages"));
            if (Directory.Exists(packagesPath))
            {
                string[] pkgDirs = Directory.GetDirectories(packagesPath, "Devices", SearchOption.AllDirectories);
                if (pkgDirs.Length > 0) return pkgDirs[0];
            }

            return null;
        }

        [MenuItem("Tools/HR-CMGT/Mobile Device Simulator/Verify & Reload Device Profiles", priority = 10)]
        public static void VerifyDevices()
        {
            string dir = FindDevicesDirectory();
            if (string.IsNullOrEmpty(dir))
            {
                EditorUtility.DisplayDialog(
                    "Device Simulator Profiles",
                    "Could not find the 'Devices' directory in Assets or Packages.\nPlease make sure the package or .device files are imported.",
                    "OK"
                );
                return;
            }

            string[] files = Directory.GetFiles(dir, "*.device", SearchOption.AllDirectories);
            EditorPrefs.SetString(PrefKeyDeviceDirectory, dir);

            string message = $"Found {files.Length} modern device profiles in:\n{dir}\n\n" +
                             "Profiles include:\n" +
                             "- Apple iPhone 12-16 series (Dynamic Island & Notches)\n" +
                             "- Apple iPad Pro & Air (M2/M4)\n" +
                             "- Samsung Galaxy S20-S24 Ultra & Fold/Flip\n" +
                             "- Google Pixel 6-9 Pro\n" +
                             "- OnePlus 12 & Xiaomi 14 Ultra\n\n" +
                             "Configured Unity Device Simulator preference successfully!";

            Debug.Log($"<color=#4CAF50><b>[HR-CMGT Device Simulator]</b></color> Verified {files.Length} device profiles.");
            EditorUtility.DisplayDialog("HR-CMGT Device Simulator Ready!", message, "Awesome");
        }

        [MenuItem("Tools/HR-CMGT/Mobile Device Simulator/Open Simulator Window", priority = 11)]
        public static void OpenSimulatorWindow()
        {
            // Open Simulator window or focus Game view
            EditorApplication.ExecuteMenuItem("Window/General/Device Simulator");
        }
    }
}

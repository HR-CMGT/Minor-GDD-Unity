# Git & Team Collaboration Guide for Unity

In this guide, you learn how to collaborate on a Unity project using Git and **Git LFS (Large File Storage)** without overwriting team members' work or causing scene merge conflicts.

---

## 🎯 3 Golden Rules for Unity Teams

1. **Always use Git LFS for binary files:** Large 3D models, audio files, and textures belong in LFS, not in the raw Git commit history.
2. **NEVER work simultaneously in the same `.unity` scene:** Each team member develops features inside **dedicated Prefabs** or isolated test scenes.
3. **Enable 'Force Text' serialization:** This enables clean text diffs for Unity meta files.

---

## ⚙️ 1. Unity Editor Project Settings

Verify these settings before making your first commit:
1. Navigate to: `Edit > Project Settings > Editor`.
2. **Asset Serialization:** Set Mode to **Force Text**.
3. **Version Control:** Set Mode to **Visible Meta Files**.

---

## 📄 2. The Official Unity `.gitignore`

Place this `.gitignore` file in the root of your repository:

```gitignore
# Unity temporary directories & builds
/[Ll]ibrary/
/[Tt]emp/
/[Oo]bj/
/[Bb]uild/
/[Bb]uilds/
/[Ll]ogs/
/[Uu]ser[Ss]ettings/
/[Mm]emoryCaptures/

# Visual Studio / Rider project files (rebuilt automatically)
*.csproj
*.unityproj
*.sln
*.suo
*.user
*.userprefs
*.pidb
*.booproj
*.svd
*.pdb
*.opendb
*.VC.db
.vs/
.idea/

# OS specific files
.DS_Store
Thumbs.db
```

---

## 📦 3. Git LFS Configuration (`.gitattributes`)

Install Git LFS once globally on your workstation:
```bash
git lfs install
```

Place this `.gitattributes` file in the root of your repository:

```gitattributes
# 3D Models
*.fbx filter=lfs diff=lfs merge=lfs -text
*.obj filter=lfs diff=lfs merge=lfs -text
*.blend filter=lfs diff=lfs merge=lfs -text
*.dae filter=lfs diff=lfs merge=lfs -text

# Textures & Graphics
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.jpeg filter=lfs diff=lfs merge=lfs -text
*.tga filter=lfs diff=lfs merge=lfs -text
*.psd filter=lfs diff=lfs merge=lfs -text
*.exr filter=lfs diff=lfs merge=lfs -text
*.hdr filter=lfs diff=lfs merge=lfs -text

# Audio & Video
*.wav filter=lfs diff=lfs merge=lfs -text
*.mp3 filter=lfs diff=lfs merge=lfs -text
*.ogg filter=lfs diff=lfs merge=lfs -text
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.mov filter=lfs diff=lfs merge=lfs -text

# Unity Packages & Builds
*.unitypackage filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text
```

---

## 🌿 4. Team Workflow & Preventing Merge Conflicts

```
[MAIN Branch] (Always stable, playable & reviewed)
      │
      ├──> [Branch: feature/player-movement]  ──> (Developer A: Works inside Player.prefab)
      │                                                   │
      ├──> [Branch: feature/enemy-ai]         ──> (Developer B: Works inside Enemy.prefab)
      │                                                   │
      └─── Pull Requests merged into MAIN after review ───┘
```

### The Prefab-Based Scene Workflow:
- The master scene `Main_Level.unity` contains only static geometry and empty spawn points.
- Players, enemies, UI, and managers are **Prefabs**.
- When Developer A updates player logic, she edits `Player.prefab`. Developer B can simultaneously edit `Enemy.prefab` **without ever triggering a scene merge conflict!**

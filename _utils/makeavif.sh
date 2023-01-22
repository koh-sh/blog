#!/usr/bin/env bash
set -eu

SCREENSHOT_DIR=$HOME/Desktop
IMAGES_DIR=static/images

cd "$(dirname "$0")/.."

# It use https://github.com/kornelski/cavif-rs
if ! command -v cavif 1>/dev/null 2>/dev/null; then
    echo "cavif is required"
    exit 1
fi

# find latest screen shot
latest_ss=$(find "${SCREENSHOT_DIR}" -name Screenshot\*.png | sort | tail -n 1)
if [ -z "${latest_ss}" ]; then
    echo "no ScreenShot found"
    exit 0
fi

# convert latest screen shot from png to avif
converted_avif="${latest_ss/.png/.avif}"
if [ ! -f "${converted_avif}" ]; then
    cavif "${latest_ss}" 1>/dev/null
fi

# find WIP post
wip_post=$(git ls-files --others --exclude-standard | grep '.md$'; true)
if [ -z "${wip_post}" ]; then
    echo "converted latest screenshot to avif"
    echo "${converted_avif}"
    exit 0
fi

# create dir for WIP post
static_dir_for_wip="${IMAGES_DIR}/$(echo "${wip_post##*/}" | sed -e 's/.md//')"
mkdir -p "${static_dir_for_wip}"

# put avif to static
current_latest_avif=$(find "${static_dir_for_wip}" -name \*.avif | sort | tail -n 1)
if [ -z "${current_latest_avif}" ]; then
    target_path="${static_dir_for_wip}/1.avif"
elif diff -q "${converted_avif}" "${current_latest_avif}" 1>/dev/null; then
    target_path="${current_latest_avif}"
else
    current_file_num=$(basename "${current_latest_avif}" | sed -e 's/.avif//')
    target_file_num=$((current_file_num+1))
    target_path="${static_dir_for_wip}/${target_file_num}.avif"
fi

mv "${converted_avif}" "${target_path}"
echo "converted latest screenshot to avif and put in ${target_path}"
echo "![img](${target_path#static})"
exit 0

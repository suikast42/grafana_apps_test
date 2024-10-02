package main

import (
	"fmt"
	"github.com/acme/demo/pkg/plugin"
	"regexp"
)

func main() {
	var re = regexp.MustCompile(`^.*/({[^}]*})`)
	var re2 = regexp.MustCompile(`^.*\?(.+)`)
	//var re3 = regexp.MustCompile(`^.*/({[^}]*})`)
	var devices = regexp.MustCompile(`[^,{}]+`)
	var str = `devices_per_frame/devices/{First,a,a1,a1a,noldu,a11,1a,11,111,111a,Last}`
	var str2 = `devices_per_frame/devices?All`
	var str3 = `devices_per_frame/devices?device_1`
	var strx = `devices_per_frame/devices`
	var strx_2 = `devices_per_frame/devicesXAll`
	var strx_3 = `devices_per_frame/devicesXdevice_1`
	{
		match := plugin.Devices_regex_onlyselected.Match([]byte(str))
		if !match {
			allString := plugin.Devices_regex_onlyselected.FindAllString(str, -1)

			fmt.Println("UUuups  str", str, len(allString))
		}
		match = plugin.Devices_regex_onlyselected.Match([]byte(str2))
		if !match {
			fmt.Println("UUuups  str2", str2)
		}
		match = plugin.Devices_regex_onlyselected.Match([]byte(str3))
		if !match {
			fmt.Println("UUuups  str3", str3)
		}
		match = plugin.Devices_regex_onlyselected.Match([]byte(strx))
		if match {
			fmt.Println("UUuups  strx", strx)
		}
		match = plugin.Devices_regex_onlyselected.Match([]byte(strx_2))
		if match {
			fmt.Println("UUuups  strx_2", strx_2)
		}
		match = plugin.Devices_regex_onlyselected.Match([]byte(strx_3))
		if match {
			fmt.Println("UUuups  strx_3", strx_3)
		}
	}
	{ // test str

		var testStr = str
		firstMatch := re.FindAllStringSubmatch(testStr, -1)
		if len(firstMatch) != 1 {
			fmt.Println("str does not compilee")
		} else {
			devicesListMatch := firstMatch[0][1]
			for ii, submatch := range devices.FindAllString(devicesListMatch, -1) {
				fmt.Println("\t\t", submatch, ": str found at index", ii, " parent idx:", 1)
			}
		}

	}

	{ // test str2

		var testStr = str2
		firstMatch := re2.FindAllStringSubmatch(testStr, -1)
		if len(firstMatch) != 1 {
			fmt.Println("str2 does not compilee")
		} else {
			devicesListMatch := firstMatch[0][1]
			for ii, submatch := range devices.FindAllString(devicesListMatch, -1) {
				fmt.Println("\t\t", submatch, ": str2 found at index", ii, " parent idx:", 1)
			}
		}

	}
	{ // test str3

		var testStr = str3
		firstMatch := re2.FindAllStringSubmatch(testStr, -1)
		if len(firstMatch) != 1 {
			fmt.Println("str3 does not compilee")
		} else {
			devicesListMatch := firstMatch[0][1]
			for ii, submatch := range devices.FindAllString(devicesListMatch, -1) {
				fmt.Println("\t\t", submatch, ": str3 found at index", ii, " parent idx:", 1)
			}
		}

	}

	//}
	//var re = regexp.MustCompile(`^devices/({[^}]*})`)
	//var devices = regexp.MustCompile(`[^,{}]+`)
	//var str = `devices/{a,a1,a1a,noldu?,a11,1a,11,111,111a}`
	//for i, value := range re.FindAllStringSubmatch(str, -1) {
	//	fmt.Println(value, ": found at index", i, " parent idx:", i)
	//	for i2, element := range value {
	//		if i2 != 1 {
	//			continue
	//		}
	//		fmt.Println("\t", element, ": found at index", i2, " parent idx:", i)
	//		for ii, submatch := range devices.FindAllString(element, -1) {
	//			fmt.Println("\t\t", submatch, ": found at index", ii, " parent idx:", i2)
	//		}
	//	}
	//}
}

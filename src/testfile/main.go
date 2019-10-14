package main

// MyStruct 介绍
type MyStruct struct {
	Value int
	Key   string
	Do    func(
		a int,
		b struct {
			A, B int
			C    string
		})
	S struct{ A int }
}

type MyStruct2 struct {
	Value int
	Key   string
	Do    func(
		a int,
		b struct {
			A, B int
			C    string
		})
	S struct{ A struct{ C interface{} } }
}

// SetSAC Set C interface{}
func (ms *MyStruct2) SetSAC(C interface{}) {
	ms.S.A.C = C
}

// GetKey Get return Key string
func (ms *MyStruct2) GetKey() string {
	return ms.Key
}

// SetKey Set Key string
func (ms *MyStruct2) SetKey(Key string) {
	ms.Key = Key
}

// GetValue Get return Value int
func (ms *MyStruct2) GetValue() int {
	return ms.Value
}

// DoFunc 非常丑陋的兼容
func DoFunc(a func(
	a int,
	b struct {
		A, B int
		C    string
	})) {
	return
}

// ExStruct 升级
type ExStruct struct {
	ChildStruct struct {
		age    int
		Height interface{}
		girl   string
		boy    int
	}
	Age   string
	Do    func(a int, b string)
	child string
}

func main() {
	a := ExStruct{}
	b := MyStruct{}
	c := MyStruct2{}
	println(a, b, c)
}

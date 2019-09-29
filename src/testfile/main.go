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

// DoFunc 非常丑陋
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
		A int
		B interface{}
	}
	C string
	D func(a int, b string)
}

// SetChildStructA set
func (e *ExStruct) SetChildStructA(a int) {
	e.ChildStruct.A = a
}

func main() {
	a := ExStruct{}
	b := MyStruct{}
	c := MyStruct2{}
	println(a, b, c)
}

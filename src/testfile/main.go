package main

// MyStruct 介绍
type MyStruct struct {
	Value int
	Key   string
	Do    func(
		a int,
		b struct{ A, B int })
	S struct{ A int }
}

// ExStruct 升级
type ExStruct struct {
	ChildStruct struct {
		A int
		B interface{}
	}
}

// SetChildStructA set
func (e *ExStruct) SetChildStructA(a int) {
	e.ChildStruct.A = a
}

func main() {
	a := ExStruct{}
	println(a)
}

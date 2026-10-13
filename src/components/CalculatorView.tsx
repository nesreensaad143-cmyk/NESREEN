import React, { useState } from 'react';
import {
  Calculator as CalcIcon,
  Percent,
  Plus,
  Minus,
  Divide,
  X,
  RotateCcw,
  Equal,
  Delete,
  Target,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface GradeItem {
  id: string;
  name: string;
  score: number;
  maxScore: number;
}

export const CalculatorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'standard' | 'gpa' | 'target'>('standard');

  // ================= 1. STANDARD CALCULATOR STATE =================
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  const handleNumber = (n: string) => {
    setDisplay((prev) => {
      if (prev === '0' || prev === 'خطأ' || prev === 'لا يمكن القسمة على صفر') return n;
      return prev + n;
    });
  };

  const handleOperator = (op: string) => {
    if (display === 'خطأ' || display === 'لا يمكن القسمة على صفر') return;
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'خطأ' || prev === 'لا يمكن القسمة على صفر') return '0';
      return prev.slice(0, -1);
    });
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay((val / 100).toString());
    }
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
    }
  };

  const handleCalculate = () => {
    if (!equation) return;
    const parts = equation.trim().split(' ');
    if (parts.length < 2) return;

    const op1 = parseFloat(parts[0]);
    const operator = parts[1];
    const op2 = parseFloat(display);

    if (isNaN(op1) || isNaN(op2)) {
      setDisplay('خطأ');
      return;
    }

    let result = 0;
    if (operator === '+') result = op1 + op2;
    else if (operator === '−' || operator === '-') result = op1 - op2;
    else if (operator === '×' || operator === '*') result = op1 * op2;
    else if (operator === '÷' || operator === '/') {
      if (op2 === 0) {
        setDisplay('لا يمكن القسمة على صفر');
        setEquation('');
        return;
      }
      result = op1 / op2;
    }

    const rounded = Math.round(result * 100000) / 100000;
    const historyItem = `${op1} ${operator} ${op2} = ${rounded}`;
    setCalcHistory((prev) => [historyItem, ...prev.slice(0, 4)]);
    setDisplay(rounded.toString());
    setEquation('');
  };

  // ================= 2. GPA & AVERAGE CALCULATOR STATE =================
  const [grades, setGrades] = useState<GradeItem[]>([
    { id: 'law-1', name: 'القانون الدستوري', score: 85, maxScore: 100 },
    { id: 'law-2', name: 'قانون العقوبات العام', score: 88, maxScore: 100 },
    { id: 'law-3', name: 'قانون المالية العامة والتشريع الضريبي', score: 82, maxScore: 100 },
    { id: 'law-4', name: 'أصول البحث القانوني', score: 92, maxScore: 100 },
  ]);

  const loadLawSubjectsGrades = () => {
    setGrades([
      { id: 'law-1', name: 'القانون الدستوري', score: 85, maxScore: 100 },
      { id: 'law-2', name: 'قانون العقوبات العام', score: 88, maxScore: 100 },
      { id: 'law-3', name: 'قانون المالية العامة والتشريع الضريبي', score: 82, maxScore: 100 },
      { id: 'law-4', name: 'أصول البحث القانوني', score: 92, maxScore: 100 },
    ]);
  };

  const addGradeRow = () => {
    setGrades((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `مادة جديدة ${prev.length + 1}`,
        score: 80,
        maxScore: 100,
      },
    ]);
  };

  const updateGradeRow = (id: string, field: 'name' | 'score' | 'maxScore', value: string | number) => {
    setGrades((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const removeGradeRow = (id: string) => {
    setGrades((prev) => prev.filter((g) => g.id !== id));
  };

  // Calculate totals
  const totalEarned = grades.reduce((acc, g) => acc + (Number(g.score) || 0), 0);
  const totalMax = grades.reduce((acc, g) => acc + (Number(g.maxScore) || 100), 0);
  const overallPercentage = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;
  const gpa4 = (overallPercentage / 100) * 4;

  const getAppreciation = (percent: number) => {
    if (percent >= 90) return { label: 'ممتاز (Excellent)', color: 'text-emerald-700 bg-emerald-50' };
    if (percent >= 80) return { label: 'جيد جداً (Very Good)', color: 'text-purple-700 bg-purple-50' };
    if (percent >= 70) return { label: 'جيد (Good)', color: 'text-indigo-700 bg-indigo-50' };
    if (percent >= 60) return { label: 'مقبول (Pass)', color: 'text-amber-700 bg-amber-50' };
    return { label: 'بحاجة لتحسين', color: 'text-rose-700 bg-rose-50' };
  };

  // ================= 3. TARGET GRADE CALCULATOR STATE =================
  const [currentScore, setCurrentScore] = useState<number>(65);
  const [currentMaxPossible, setCurrentMaxPossible] = useState<number>(70);
  const [remainingExamMarks, setRemainingExamMarks] = useState<number>(30);
  const [targetPercentage, setTargetPercentage] = useState<number>(90);

  // Target calculation formula
  // Total points in course = currentMaxPossible + remainingExamMarks
  // Total points needed for targetPercentage = (totalCoursePoints * targetPercentage) / 100
  // Required in remaining exam = pointsNeeded - currentScore
  const totalCoursePoints = currentMaxPossible + remainingExamMarks;
  const pointsNeededOverall = (totalCoursePoints * targetPercentage) / 100;
  const scoreNeededInFinal = Math.max(0, pointsNeededOverall - currentScore);
  const percentNeededInFinal =
    remainingExamMarks > 0 ? (scoreNeededInFinal / remainingExamMarks) * 100 : 0;

  const isTargetAchievable = scoreNeededInFinal <= remainingExamMarks;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            الآلة الحاسبة وحساب المعدل
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            آلة حاسبة علمية، حساب المجموع والنسبة المئوية، ومعرفة الدرجة المطلوبة للتفوق
          </p>
        </div>

        {/* Tab switcher */}
        <div className="bg-purple-50 p-1 rounded-2xl flex items-center">
          <button
            onClick={() => setActiveTab('standard')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'standard'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الحاسبة القياسية
          </button>
          <button
            onClick={() => setActiveTab('gpa')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'gpa'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المعدل والنسبة
          </button>
          <button
            onClick={() => setActiveTab('target')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'target'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الدرجة المستهدفة
          </button>
        </div>
      </div>

      {/* TAB 1: STANDARD CALCULATOR */}
      {activeTab === 'standard' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 border border-purple-100 shadow-xl shadow-purple-900/5">
          {/* Display screen */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 mb-4 text-left font-mono">
            <div className="text-xs text-slate-400 h-5 text-right overflow-hidden">
              {equation}
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-right tracking-tight truncate mt-1">
              {display}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={handleClear}
              className="py-3.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-sm transition-colors"
            >
              C
            </button>
            <button
              onClick={handleBackspace}
              className="py-3.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-sm transition-colors flex items-center justify-center"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              onClick={handlePercent}
              className="py-3.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-sm transition-colors"
            >
              %
            </button>
            <button
              onClick={() => handleOperator('÷')}
              className="py-3.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold text-lg transition-colors"
            >
              ÷
            </button>

            <button
              onClick={() => handleNumber('7')}
              className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              7
            </button>
            <button
              onClick={() => handleNumber('8')}
              className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              8
            </button>
            <button
              onClick={() => handleNumber('9')}
              className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              9
            </button>
            <button
              onClick={() => handleOperator('×')}
              className="py-3.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold text-lg transition-colors"
            >
              ×
            </button>

            <button
              onClick={() => handleNumber('4')}
              className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              4
            </button>
            <button
              onClick={() => handleNumber('5')}
              className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              5
            </button>
            <button
              onClick={() => handleNumber('6')}
              className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              6
            </button>
            <button
              onClick={() => handleOperator('−')}
              className="py-3.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold text-lg transition-colors"
            >
              −
            </button>

            <button
              onClick={() => handleNumber('1')}
              className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              1
            </button>
            <button
              onClick={() => handleNumber('2')}
              className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              2
            </button>
            <button
              onClick={() => handleNumber('3')}
              className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              3
            </button>
            <button
              onClick={() => handleOperator('+')}
              className="py-3.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold text-lg transition-colors"
            >
              +
            </button>

            <button
              onClick={() => handleNumber('0')}
              className="col-span-2 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              0
            </button>
            <button
              onClick={handleDecimal}
              className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
            >
              .
            </button>
            <button
              onClick={handleCalculate}
              className="py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white hover:opacity-95 font-black text-xl transition-all shadow-md shadow-purple-500/25"
            >
              =
            </button>
          </div>

          {/* Quick History */}
          {calcHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-purple-50">
              <span className="block text-[11px] font-bold text-slate-400 mb-2">سجل العمليات الأخير:</span>
              <div className="space-y-1">
                {calcHistory.map((h, i) => (
                  <div key={i} className="text-xs text-slate-600 font-mono text-left bg-slate-50 px-2.5 py-1 rounded-lg">
                    {h}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GPA & GRADES AVERAGE CALCULATOR */}
      {activeTab === 'gpa' && (
        <div className="space-y-6">
          {/* Summary Score Card */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-md shadow-purple-900/5 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100/60">
              <span className="block text-2xl sm:text-3xl font-black text-purple-900">
                {Math.round(overallPercentage * 10) / 10}%
              </span>
              <span className="text-xs font-semibold text-purple-600">النسبة المئوية العامة</span>
            </div>

            <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100/60">
              <span className="block text-2xl sm:text-3xl font-black text-purple-900">
                {Math.round(gpa4 * 100) / 100} / 4.0
              </span>
              <span className="text-xs font-semibold text-purple-600">المعدل التراكمي (GPA)</span>
            </div>

            <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100/60">
              <span className="block text-2xl sm:text-3xl font-black text-purple-900">
                {totalEarned} / {totalMax}
              </span>
              <span className="text-xs font-semibold text-purple-600">مجموع الدرجات</span>
            </div>

            <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100/60 flex flex-col justify-center">
              <span className={`block text-sm font-black px-2 py-1 rounded-lg ${getAppreciation(overallPercentage).color}`}>
                {getAppreciation(overallPercentage).label}
              </span>
              <span className="text-xs font-semibold text-slate-500 mt-1">التقدير العام</span>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-purple-50">
              <h3 className="font-extrabold text-base text-slate-900">
                درجات المواد الدراسية ({grades.length})
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadLawSubjectsGrades}
                  className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="استعادة مواد القانون العام الأربعة"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>مواد القانون العام</span>
                </button>

                <button
                  onClick={addGradeRow}
                  className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مادة</span>
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {grades.map((grade) => {
                const percent = grade.maxScore > 0 ? (grade.score / grade.maxScore) * 100 : 0;

                return (
                  <div
                    key={grade.id}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 bg-white"
                  >
                    <input
                      type="text"
                      value={grade.name}
                      onChange={(e) => updateGradeRow(grade.id, 'name', e.target.value)}
                      placeholder="اسم المادة"
                      className="w-full sm:w-1/3 px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:border-purple-500 outline-none"
                    />

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-slate-500">الدرجة:</label>
                        <input
                          type="number"
                          value={grade.score}
                          onChange={(e) => updateGradeRow(grade.id, 'score', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-center font-bold focus:border-purple-500 outline-none"
                        />
                      </div>

                      <span className="text-slate-400 font-bold">من</span>

                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-slate-500">العظمى:</label>
                        <input
                          type="number"
                          value={grade.maxScore}
                          onChange={(e) => updateGradeRow(grade.id, 'maxScore', parseFloat(e.target.value) || 100)}
                          className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-center font-bold focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                        {Math.round(percent)}%
                      </span>

                      <button
                        onClick={() => removeGradeRow(grade.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        title="حذف المادة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TARGET GRADE CALCULATOR */}
      {activeTab === 'target' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-xl shadow-purple-900/5 text-right">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-50">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="font-extrabold text-base text-slate-900">
                حاسبة الدرجة المطلوبة في الامتحان النهائي لتحقيق هدفك
              </h3>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              أدخل درجاتك الحالية في أعمال السنة والدرجات المتبقية، وسنحسب لك بدقة كم تحتاج في الامتحان القادم لتحقيق النسبة التي تطمح إليها.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مجموع درجاتك المحققة حتى الآن
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الدرجة العظمى الممكنة حتى الآن
                </label>
                <input
                  type="number"
                  min="1"
                  value={currentMaxPossible}
                  onChange={(e) => setCurrentMaxPossible(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  درجة الامتحان القادم / النهائي المتبقية
                </label>
                <input
                  type="number"
                  min="1"
                  value={remainingExamMarks}
                  onChange={(e) => setRemainingExamMarks(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  النسبة المئوية المستهدفة للمادة (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none font-bold text-purple-700"
                />
              </div>
            </div>

            {/* Result Box */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-purple-600 block mb-1">
                    النتيجة المطلوبة في الامتحان:
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-purple-950">
                      {Math.max(0, Math.round(scoreNeededInFinal * 10) / 10)}
                    </span>
                    <span className="text-sm font-bold text-slate-600">
                      من أصل {remainingExamMarks} درجة
                    </span>
                    <span className="text-xs font-semibold text-purple-700 bg-white px-2 py-0.5 rounded-md shadow-xs">
                      ({Math.round(percentNeededInFinal)}%)
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isTargetAchievable ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>الهدف ممكن وقابل للتحقيق!</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1.5 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>الهدف يتجاوز الدرجة العظمى المتبقية</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-purple-100/60 leading-relaxed">
                لتحقيق نسبة {targetPercentage}% في المادة (المجموع الكلي {totalCoursePoints} درجة)، تحتاج للحصول على ما لا يقل عن{' '}
                <strong className="text-purple-900">{Math.round(scoreNeededInFinal * 10) / 10} درجة</strong> في الامتحان النهائي.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

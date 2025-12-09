import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, AlertCircle } from "lucide-react";

interface GradeQuestionnaireProps {
  onGradeCalculated: (grade: string, answers: Record<string, number>) => void;
}

const questions = [
  {
    id: "uniformity",
    title: "Uniformity of Produce",
    description: "How uniform is the size, shape, and color across the batch?",
    options: [
      { value: 0, label: "Highly Uniform", description: "90%+ consistency in size/shape/color" },
      { value: 1, label: "Moderately Uniform", description: "60-90% consistency" },
      { value: 2, label: "Low Uniformity", description: "Less than 60% consistency" },
    ],
  },
  {
    id: "defects",
    title: "Visible Defects",
    description: "What percentage of produce has visible damage, spots, or blemishes?",
    options: [
      { value: 0, label: "Minimal Defects", description: "Less than 5% affected" },
      { value: 1, label: "Some Defects", description: "5-15% affected" },
      { value: 2, label: "Many Defects", description: "More than 15% affected" },
    ],
  },
  {
    id: "ripeness",
    title: "Ripeness Level",
    description: "What is the ripeness condition of the harvest?",
    options: [
      { value: 0, label: "Optimal Ripeness", description: "Ready for market/processing" },
      { value: 1, label: "Slightly Under/Over", description: "Minor ripeness variation" },
      { value: 2, label: "Inconsistent Ripeness", description: "Mixed stages of ripeness" },
    ],
  },
  {
    id: "size",
    title: "Size Consistency",
    description: "How consistent is the size of individual items?",
    options: [
      { value: 0, label: "Very Consistent", description: "Meets market size standards" },
      { value: 1, label: "Moderately Consistent", description: "Some size variation" },
      { value: 2, label: "Highly Variable", description: "Significant size differences" },
    ],
  },
];

export function GradeQuestionnaire({ onGradeCalculated }: GradeQuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);

  const calculateGrade = () => {
    let grade: string;
    if (totalScore <= 1) {
      grade = "A";
    } else if (totalScore === 2) {
      grade = "B";
    } else {
      grade = "C";
    }
    setShowResult(true);
    onGradeCalculated(grade, answers);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-500";
      case "B": return "bg-yellow-500";
      case "C": return "bg-orange-500";
      default: return "bg-muted";
    }
  };

  const preliminaryGrade = totalScore <= 1 ? "A" : totalScore === 2 ? "B" : "C";

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Quality Assessment Questionnaire
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Answer these questions honestly to determine the preliminary grade
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {index + 1}
              </span>
              <div>
                <h4 className="font-medium">{question.title}</h4>
                <p className="text-sm text-muted-foreground">{question.description}</p>
              </div>
            </div>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => setAnswers({ ...answers, [question.id]: parseInt(value) })}
              className="ml-8 space-y-2"
            >
              {question.options.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${
                    answers[question.id] === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value.toString()} id={`${question.id}-${option.value}`} />
                  <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{option.label}</span>
                    <span className="ml-2 text-sm text-muted-foreground">— {option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        {allAnswered && !showResult && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Based on your answers:</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-medium">Preliminary Grade:</span>
                  <Badge className={`${getGradeColor(preliminaryGrade)} text-white`}>
                    Grade {preliminaryGrade}
                  </Badge>
                  <span className="text-sm text-muted-foreground">(Score: {totalScore}/8)</span>
                </div>
              </div>
              <Button onClick={calculateGrade}>
                Confirm Grade
              </Button>
            </div>
          </div>
        )}

        {!allAnswered && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Please answer all questions to calculate the grade
          </div>
        )}
      </CardContent>
    </Card>
  );
}

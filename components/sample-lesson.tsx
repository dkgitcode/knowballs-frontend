/* eslint-disable */

import React from 'react'
import { VideoComponent } from '@/components/ui/video-component'
import { Explainer } from './explainer'

export default function LinearRegressionLesson() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <header className="space-y-4">
        <h1
          className="text-4xl font-bold text-primary animate-slide-up-in opacity-0"
          style={{ animationDelay: "0s" }}
        >
          Mastering Linear Regression: A Deep Dive
        </h1>
        <p
          className="text-lg text-muted-foreground animate-slide-up-in opacity-0"
          style={{ animationDelay: "0.2s" }}
        >
          Learn everything about Linear Regression—from fundamentals to advanced techniques.
        </p>
      </header>

      <section className="space-y-12">
        {/* Introduction */}
        <div
          className="space-y-4 animate-slide-up-in opacity-0"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-2xl font-semibold text-primary">1. What is Linear Regression?</h2>
          <div className="text-muted-foreground">
            Linear Regression is a <Explainer
              term="supervised learning algorithm"
              definition="A type of machine learning where the model learns from labeled training data."
              explanation="The algorithm is 'supervised' because it's trained on a dataset where the correct answers are provided, allowing it to learn the relationship between inputs and outputs."
            >
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Example:</h4>
                <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">
                  Training Data:
                  X: [size] → Y: [price]
                  100m² → $200,000
                  150m² → $300,000
                </pre>
              </div>
            </Explainer>

            that models the relationship between a dependent variable (Y) and one or more independent variables (X). The goal is to find the best-fitting straight line that minimizes the error in predictions.
          </div>
          <VideoComponent
            title="Introduction to Linear Regression"
            description="Visualizing the concept of best-fit lines"
            src="/1.mp4"
          />
        </div>

        {/* The Math Behind It */}
        <div
          className="space-y-4 animate-slide-up-in opacity-0"
          style={{ animationDelay: "0.6s" }}
        >
          <h2 className="text-2xl font-semibold text-primary">2. The Mathematics</h2>
          <p className="text-muted-foreground">
            The equation of a simple linear regression model is:
          </p>
          <pre className="bg-muted p-4 rounded-md">y = mx + b</pre>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li>y: The predicted value</li>
            <li>x: The independent variable</li>
            <li>m: The slope (rate of change)</li>
            <li>b: The y-intercept</li>
          </ul>
          <VideoComponent
            title="The Linear Regression Formula"
            description="Breaking down y = mx + b"
            src="/2.mp4"
          />
        </div>

        {/* Assumptions of Linear Regression */}
        <div
          className="space-y-4 animate-slide-up-in opacity-0"
          style={{ animationDelay: "0.7s" }}
        >
          <h2 className="text-2xl font-semibold text-primary">3. Assumptions of Linear Regression</h2>
          <p className="text-muted-foreground">
            To ensure accurate predictions, linear regression relies on several assumptions:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li>Linearity: The relationship between X and Y must be linear.</li>
            <li>Independence: The observations should be independent of each other.</li>
            <li>Homoscedasticity: The variance of residuals should be constant across all values of X.</li>
            <li>Normality: Residuals should be normally distributed.</li>
          </ul>
        </div>

        {/* Error and Loss Function */}
        <div
          className="space-y-4 animate-slide-up-in opacity-0"
          style={{ animationDelay: "0.8s" }}
        >
          <h2 className="text-2xl font-semibold text-primary">4. Error and Cost Function</h2>
          <p className="text-muted-foreground">
            The accuracy of our model depends on how well it minimizes error. The most commonly used error function is <Explainer
              term="Mean Squared Error (MSE)"
              definition="A measure of the average squared difference between predicted and actual values."
              explanation="MSE is calculated by taking the average of the squared differences between each predicted value and its corresponding actual value. Squaring the differences ensures all terms are positive and penalizes larger errors more heavily."
            >Mean Squared Error (MSE)</Explainer>:
          </p>
          <pre className="bg-muted p-4 rounded-md">MSE = (1/n) * Σ (y - ŷ)²</pre>

          <VideoComponent
            title="Mean Squared Error"
            description="Visualizing the concept of Mean Squared Error"
            src="/3.mp4"
          />
        </div>

        {/* Gradient Descent */}
        <div
          className="space-y-4 animate-slide-up-in opacity-0"
          style={{ animationDelay: "0.9s" }}
        >
          <h2 className="text-2xl font-semibold text-primary">5. Optimizing Using Gradient Descent</h2>
          <p className="text-muted-foreground">
            To find the best parameters (m, b), we use <Explainer
              term="Gradient Descent"
              definition="An optimization algorithm that finds the minimum of a function by iteratively moving in the direction of steepest descent."
              explanation="The algorithm works by calculating the gradient (derivative) of the loss function with respect to each parameter, then updating the parameters in the opposite direction of the gradient."
            >Gradient Descent</Explainer>:
          </p>
          <pre className="bg-muted p-4 rounded-md">m := m - α * (∂MSE/∂m)</pre>
          <pre className="bg-muted p-4 rounded-md">b := b - α * (∂MSE/∂b)</pre>
          <p className="text-muted-foreground">
            where <Explainer
              term="α (learning rate)"
              definition="A hyperparameter that determines the size of steps taken during gradient descent."
              explanation="If α is too large, the algorithm might overshoot the minimum. If it's too small, convergence will be slow. Finding the right learning rate is crucial for effective training."
            >α</Explainer> is the learning rate that controls how big of steps we take when updating our parameters.
          </p>

          <p className="text-muted-foreground">
            The gradient descent algorithm works by iteratively adjusting our parameters to minimize the loss function. Let's visualize this process:
          </p>

          <VideoComponent
            title="Gradient Descent"
            description="Visualizing the loss function and the gradient descent"
            src="/4.mp4"
          />

          <p className="text-muted-foreground">
            In the visualization above, we can see how the algorithm navigates the loss function landscape, taking steps in the direction that reduces our error the most. The size of these steps is controlled by our learning rate α.
          </p>

          <p className="text-muted-foreground">
            Once we've found the optimal parameters through gradient descent, we can see how our final line fits the data:
          </p>

          <VideoComponent
            title="Gradient Descent"
            description="Visualizing the results to the original line"
            src="/5.mp4"
          />

          <p className="text-muted-foreground">
            The final line represents our optimized linear regression model, where we've found the values of m and b that minimize our mean squared error. This line gives us the best linear approximation of our data points.
          </p>
        </div>

        {/* Real-world Example */}
        <div
          className="space-y-4 animate-slide-up-in opacity-0"
          style={{ animationDelay: "1s" }}
        >
          <h2 className="text-2xl font-semibold text-primary">6. Practical Example</h2>
          <p className="text-muted-foreground">
            Let's predict house prices based on square footage using linear regression.
          </p>
          <VideoComponent
            title="House Price Prediction"
            description="Real-world application with house prices"
            src="/6.mp4"
          />
        </div>
      </section>

      <footer
        className="pt-8 border-t border-border animate-slide-up-in opacity-0"
        style={{ animationDelay: "1.1s" }}
      >
        <p className="text-sm text-muted-foreground">
          This lesson was generated with the help of manim.
        </p>
      </footer>
    </div>
  )
}
